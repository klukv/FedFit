"""
FastAPI-приложение рекомендательного сервиса.

Pipeline inference:
  Rule Engine → (Workout Matcher | Exercise Composer) → Plan Assembler

Жизненный цикл при запуске:
  1. CatalogLoader — exercises, workouts, training_plans
  2. RuleEngine, WorkoutMatcher, MLSelector, ExerciseComposer, PlanAssembler
  3. RecommendationService — оркестратор POST /recommend
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from app.models.plan_structures import TrainingPlanResponse
from app.models.schemas import UserQuestionnaire
from app.services.catalog_loader import CatalogLoader
from app.services.exercise_composer import ExerciseComposer
from app.services.ml_selector import MLSelector
from app.services.plan_assembler import PlanAssembler
from app.services.recommendation_service import RecommendationService
from app.services.rule_engine import RuleEngine
from app.services.workout_matcher import WorkoutMatcher

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

catalog_loader: CatalogLoader = None
rule_engine: RuleEngine = None
ml_selector: MLSelector = None
workout_matcher: WorkoutMatcher = None
exercise_composer: ExerciseComposer = None
plan_assembler: PlanAssembler = None
recommendation_service: RecommendationService = None


def _build_components(force_retrain: bool = False) -> None:
    """Инициализирует или пересоздаёт компоненты сервиса."""
    global catalog_loader, rule_engine, ml_selector, workout_matcher
    global exercise_composer, plan_assembler, recommendation_service

    catalog_loader = CatalogLoader()
    rule_engine = RuleEngine(exercises=catalog_loader.catalog.exercises)
    ml_selector = MLSelector(force_retrain=force_retrain)
    workout_matcher = WorkoutMatcher(catalog_loader.catalog)
    plan_assembler = PlanAssembler(catalog_loader.catalog)
    exercise_composer = ExerciseComposer(ml_selector, plan_assembler)
    recommendation_service = RecommendationService(
        rule_engine=rule_engine,
        catalog_loader=catalog_loader,
        workout_matcher=workout_matcher,
        exercise_composer=exercise_composer,
        plan_assembler=plan_assembler,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    global catalog_loader

    logger.info("=== Запуск рекомендательного сервиса ===")
    _build_components(force_retrain=False)
    logger.info("=== Сервис готов к работе ===")

    yield

    logger.info("=== Остановка сервиса ===")


app = FastAPI(
    title="Fitness Recommendation Service",
    description=(
        "Гибрид rule-based + ML: экспертный подбор каталожных тренировок, "
        "ML-сборка из упражнений при несоответствии."
    ),
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_request_time(request: Request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    elapsed_ms = (time.perf_counter() - start) * 1000
    logger.info("%s %s — %.1fms", request.method, request.url.path, elapsed_ms)
    return response


@app.get("/health", tags=["Monitoring"])
async def health_check() -> Dict[str, Any]:
    return {
        "status": "ok",
        "components": {
            "catalog_loader": catalog_loader is not None,
            "rule_engine": rule_engine is not None,
            "workout_matcher": workout_matcher is not None,
            "ml_selector": ml_selector is not None,
            "ml_model_loaded": ml_selector.model is not None if ml_selector else False,
            "exercise_composer": exercise_composer is not None,
            "plan_assembler": plan_assembler is not None,
        },
        "catalog": {
            "exercises": len(catalog_loader.catalog.exercises) if catalog_loader else 0,
            "workouts": len(catalog_loader.catalog.workouts) if catalog_loader else 0,
            "training_plans": len(catalog_loader.catalog.training_plans) if catalog_loader else 0,
        },
        "recommendation_mode": (
            ml_selector.recommendation_source if ml_selector else "unavailable"
        ),
    }


@app.post(
    "/recommend",
    response_model=TrainingPlanResponse,
    response_model_exclude_none=True,
    response_model_by_alias=True,
    tags=["Recommendations"],
    summary="Сгенерировать персональный план тренировок",
)
async def recommend(questionnaire: UserQuestionnaire) -> TrainingPlanResponse:
    """
    ### Логика работы:
    1. **Rule Engine** — слоты плана, фильтрация упражнений
    2. Для каждого слота:
       - **Workout Matcher** — подходит ли готовая тренировка из каталога?
       - иначе **Exercise Composer** (ML-ранжирование + сборка)
    3. **Plan Assembler** — TrainingPlanResponse
    """
    if recommendation_service is None:
        raise HTTPException(status_code=503, detail="Сервис не инициализирован.")

    try:
        plan, slot_sources = recommendation_service.recommend(questionnaire)

        for slot_info in slot_sources:
            logger.info(
                "Слот день %s: source=%s (%s)",
                slot_info["day"],
                slot_info["source"],
                slot_info["name"],
            )

        return plan

    except ValueError as exc:
        if str(exc) == "empty_exercise_pool":
            raise HTTPException(
                status_code=422,
                detail=(
                    "Не найдено подходящих упражнений для указанных параметров. "
                    "Попробуйте изменить ограничения или добавить инвентарь."
                ),
            ) from exc
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Ошибка генерации плана: %s", exc)
        raise HTTPException(status_code=500, detail=f"Ошибка генерации плана: {exc}") from exc


@app.post(
    "/retrain",
    tags=["Admin"],
    summary="Переобучить ML-модель на каталоге",
)
async def retrain_model() -> Dict[str, Any]:
    """
    Переобучает модель на данных каталога (workout_exercise).
    При малом каталоге дополняет expert rules.
    После изменения БД: scripts/export_catalog.py → POST /retrain
    """
    logger.info("Запрошено переобучение модели...")
    _build_components(force_retrain=True)

    metrics = ml_selector.train_metrics if ml_selector else {}
    return {
        "status": "ok",
        "message": "Модель переобучена",
        "model_source": ml_selector.recommendation_source if ml_selector else "unavailable",
        "metrics": metrics,
    }
