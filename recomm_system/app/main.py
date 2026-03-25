"""
FastAPI-приложение рекомендательного сервиса.

Единственный бизнес-эндпоинт: POST /recommend
Дополнительно: GET /health для мониторинга

Жизненный цикл при запуске:
  1. Инициализируется RuleEngine (загружает exercises.json и templates.json)
  2. Инициализируется MLSelector (загружает или обучает модель)
  3. Инициализируется PlanBuilder
  4. Сервис готов принимать запросы

Все компоненты stateless — состояние не хранится между запросами.
Исключение: загруженная ML-модель кэшируется в памяти процесса.
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models.plan_structures import WorkoutPlanResponse
from app.models.schemas import UserQuestionnaire
from app.services.ml_selector import MLSelector
from app.services.plan_builder import PlanBuilder
from app.services.rule_engine import RuleEngine

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Глобальные компоненты сервиса
# (инициализируются один раз при старте)
# ──────────────────────────────────────────────
rule_engine: RuleEngine = None
ml_selector: MLSelector = None
plan_builder: PlanBuilder = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan-менеджер FastAPI: выполняется при старте и остановке сервиса.
    Заменяет устаревшие on_event("startup") / on_event("shutdown").
    """
    global rule_engine, ml_selector, plan_builder

    logger.info("=== Запуск рекомендательного сервиса ===")

    # Инициализация компонентов
    logger.info("Загрузка rule engine...")
    rule_engine = RuleEngine()

    logger.info("Загрузка ML selector (может занять несколько секунд при первом запуске)...")
    ml_selector = MLSelector()

    logger.info("Инициализация plan builder...")
    plan_builder = PlanBuilder()

    logger.info("=== Сервис готов к работе ===")

    yield  # Сервис работает

    # Код после yield выполняется при остановке
    logger.info("=== Остановка сервиса ===")


# ──────────────────────────────────────────────
# Создание FastAPI-приложения
# ──────────────────────────────────────────────
app = FastAPI(
    title="Fitness Recommendation Service",
    description=(
        "Микросервис для генерации персонализированных планов тренировок. "
        "Использует гибридную архитектуру: rule-based фильтрация + ML-ранжирование."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — разрешаем запросы от фронтенда фитнес-приложения
# В продакшн замените "*" на конкретный домен
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────
# MIDDLEWARE: логирование времени запроса
# ──────────────────────────────────────────────
@app.middleware("http")
async def log_request_time(request: Request, call_next):
    """Логирует время выполнения каждого запроса."""
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info(f"{request.method} {request.url.path} — {elapsed_ms:.1f}ms")
    return response


# ──────────────────────────────────────────────
# ЭНДПОИНТЫ
# ──────────────────────────────────────────────

@app.get("/health", tags=["Monitoring"])
async def health_check() -> Dict[str, Any]:
    """
    Health-check эндпоинт для систем мониторинга и оркестрации (k8s, docker-compose).

    Возвращает статус компонентов и используемый источник рекомендаций.
    """
    return {
        "status": "ok",
        "components": {
            "rule_engine": rule_engine is not None,
            "ml_selector": ml_selector is not None,
            "ml_model_loaded": ml_selector.model is not None if ml_selector else False,
            "plan_builder": plan_builder is not None,
        },
        "recommendation_mode": (
            ml_selector.recommendation_source
            if ml_selector else "unavailable"
        ),
    }


@app.post(
    "/recommend",
    response_model=WorkoutPlanResponse,
    tags=["Recommendations"],
    summary="Сгенерировать персональный план тренировок",
    responses={
        200: {"description": "Успешно сгенерированный план тренировок"},
        422: {"description": "Ошибка валидации входных данных"},
        500: {"description": "Внутренняя ошибка сервиса"},
    },
)
async def recommend(questionnaire: UserQuestionnaire) -> WorkoutPlanResponse:
    """
    Генерирует персонализированный план тренировок на основе анкеты пользователя.

    ### Логика работы:
    1. **Rule Engine** фильтрует упражнения по инвентарю, ограничениям и уровню,
       затем строит структуру плана (N тренировок по X упражнений каждая)
    2. **ML Selector** ранжирует доступные упражнения и выбирает лучшие для каждой тренировки
    3. **Plan Builder** формирует итоговый JSON-ответ

    ### Гарантии:
    - Все упражнения соответствуют доступному инвентарю
    - Все упражнения безопасны при указанных ограничениях здоровья
    - Уровень сложности соответствует подготовке пользователя
    """
    if rule_engine is None or ml_selector is None or plan_builder is None:
        raise HTTPException(
            status_code=503,
            detail="Сервис не инициализирован. Попробуйте позже."
        )

    try:
        # ── Шаг 1: Rule-based фильтрация и структурирование ──
        rule_output = rule_engine.apply(questionnaire)

        if not rule_output.available_exercises:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Не найдено подходящих упражнений для указанных параметров. "
                    "Попробуйте изменить ограничения или добавить инвентарь."
                )
            )

        # ── Шаг 2: ML-ранжирование и выбор упражнений ──
        slot_exercises = ml_selector.select(rule_output, questionnaire)

        # ── Шаг 3: Сборка плана ──
        plan = plan_builder.build(
            rule_output=rule_output,
            slot_exercises=slot_exercises,
            recommendation_source=ml_selector.recommendation_source,
        )

        return plan

    except HTTPException:
        raise  # Прокидываем HTTP-ошибки как есть
    except Exception as e:
        logger.exception(f"Неожиданная ошибка при генерации плана: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Ошибка генерации плана: {str(e)}"
        )


@app.post(
    "/retrain",
    tags=["Admin"],
    summary="Переобучить ML-модель (только для администраторов)",
)
async def retrain_model() -> Dict[str, str]:
    """
    Принудительно переобучает ML-модель на синтетических данных.

    В продакшн этот эндпоинт должен быть защищён аутентификацией
    и вызываться только при наличии новых обучающих данных.
    """
    global ml_selector

    logger.info("Запрошено переобучение модели...")
    ml_selector = MLSelector(force_retrain=True)

    return {
        "status": "ok",
        "message": "Модель успешно переобучена",
        "model_source": ml_selector.recommendation_source,
    }
