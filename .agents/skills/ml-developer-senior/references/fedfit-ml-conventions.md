# Конвенции проекта FedFit (recomm_system)

## Стек

- **FastAPI** — ASGI-приложение в `recomm_system/app/main.py`
- **Pydantic v2** — валидация входа/выхода, OpenAPI на `/docs`
- **scikit-learn** — `Pipeline` для ранжирования/классификации упражнений
- **joblib** — сериализация модели в `models/exercise_selector.pkl`
- **pandas / numpy** — подготовка признаков в `app/ml/features.py`
- **uvicorn** — запуск: `uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload`

## Расположение в монорепозитории

```
FedFit/
├── recomm_system/          # Микросервис рекомендаций (Python)
├── backend/                # Go API, вызывает recomm_system по HTTP
│   └── internal/
│       ├── clients/recommendationClient.go
│       ├── models/recommendation.go
│       └── services/recommendation_service.go
└── frontend/               # Next.js — анкета и отображение плана
```

Рабочая директория сервиса: `recomm_system/` (в README иногда упоминается как `recommendation_service` — это одно и то же по смыслу).

## API микросервиса

| Метод | Путь | Назначение |
|---|---|---|
| POST | `/recommend` | Принимает `UserQuestionnaire`, возвращает `TrainingPlanResponse` |
| GET | `/health` | Health-check для мониторинга |

Бэкенд проксирует запрос: `POST /v1/training-plans/recommendation` → `POST {RECOMMENDATION_URL}/recommend`.

## Бизнес-сущности (PostgreSQL основного приложения)

```sql
exercises (id, name, description, icon, sets, reps, duration, calories_per_set, muscle_group)
workout_plans (id, name, description, level)
workouts (id, workout_plan_id, name, description, order_index, estimated_time)
workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, duration)
```

Сервис **не имеет прямого доступа к БД**. Использует локальный кэш `app/data/exercises.json`, синхронизируемый с seed-данными бэкенда.

## Входная модель (UserQuestionnaire)

Совпадает с `backend/internal/models/recommendation.go` → `SurveyResult`:

| Поле JSON | Тип | Значения |
|---|---|---|
| `goal` | string | `weight_loss`, `muscle_gain`, `endurance`, `general_fitness` |
| `level` | string | `beginner`, `intermediate`, `advanced` |
| `equipment` | string[] | `none`, `dumbbells`, `barbell`, `pullup_bar`, `kettlebell` |
| `frequency` | int | 1–7 |
| `duration_preference` | int | 15, 30, 45, 60 |
| `restrictions` | string[] | `knee`, `back`, `shoulder` или `[]` |

## Выходная модель (TrainingPlanResponse)

Структура плана для интеграции с Go-бэкендом:

```json
{
  "workout_plan": {
    "name": "План для похудения",
    "description": "...",
    "level": "intermediate",
    "workouts": [
      {
        "name": "Тренировка 1: Кардио + верх",
        "description": "...",
        "order_index": 1,
        "estimated_time": 45,
        "exercises": [
          {
            "exercise_id": 12,
            "name": "Приседания",
            "description": "...",
            "sets": 3,
            "reps": 15,
            "duration": null
          }
        ]
      }
    ]
  }
}
```

## Гибридная архитектура

### Rule Engine (`app/services/rule_engine.py`)

- Определяет группы мышц по цели и уровню
- Задаёт min/max упражнений на тренировку
- Задаёт диапазоны сетов и повторений (например, muscle_gain: 3–5 × 8–12)
- Фильтрует по `equipment` и `restrictions`
- Возвращает **структурированное задание** для ML: слоты тренировок + отфильтрованный пул

### ML Selector (`app/services/ml_selector.py`)

- Загружает `exercise_selector.pkl` через `load_model()`
- Ранжирует упражнения по признакам из `app/ml/features.py`
- При отсутствии модели — детерминированный fallback (шаблоны / rule-based выбор)

### Plan Builder (`app/services/plan_builder.py`)

- Объединяет rule + ML результаты
- Проверяет валидность `exercise_id` по кэшу
- Формирует `TrainingPlanResponse`

## Паттерн lifespan (инициализация при старте)

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    global rule_engine, ml_selector, plan_builder
    rule_engine = RuleEngine()
    ml_selector = MLSelector()      # может обучить модель при первом запуске
    plan_builder = PlanBuilder()
    yield
```

Компоненты инициализируются один раз; запросы stateless.

## ML Pipeline (`app/ml/pipeline.py`)

- При первом запуске — обучение на синтетических данных (~5–10 с)
- Модель сохраняется в `models/exercise_selector.pkl`
- Для продакшена: переобучение на реальных логах взаимодействий пользователей

Допустимые алгоритмы для MVP: `RandomForestClassifier`, `KNeighborsClassifier`, ранжирование по скору.

## Данные

### `app/data/exercises.json`

Массив упражнений с полями для rule/ML:

- `id`, `name`, `description`, `muscle_group`
- `equipment_required`, `restrictions_avoid` (для фильтрации)
- `default_sets`, `default_reps`, `default_duration`

### `app/data/templates.json`

Шаблоны планов по `goal`: названия тренировок, описания, распределение групп мышц.

## Зависимости (`requirements.txt`)

```
fastapi
uvicorn[standard]
pydantic
scikit-learn
joblib
pandas
numpy
```

Только эти библиотеки для прототипа — не добавляй лишнего без обоснования.

## Ограничения

- Время ответа < 2 секунд (синхронный вызов от бэкенда)
- Stateless между запросами
- Код самодостаточен и запускается локально
- Комментарии к нетривиальной логике; явные пометки о допущениях (синтетические данные)

## Примеры curl

```bash
# Health
curl http://localhost:8001/health

# Рекомендация
curl -X POST http://localhost:8001/recommend \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "weight_loss",
    "level": "intermediate",
    "equipment": ["none"],
    "frequency": 3,
    "duration_preference": 45,
    "restrictions": []
  }'
```

## Существующие файлы (для переиспользования паттернов)

| Файл | Что смотреть |
|---|---|
| `app/services/rule_engine.py` | Фильтрация, слоты, диапазоны параметров |
| `app/services/ml_selector.py` | Загрузка модели, fallback |
| `app/services/plan_builder.py` | Сборка JSON-плана |
| `app/ml/features.py` | One-hot, нормализация признаков |
| `app/ml/pipeline.py` | Обучение и `load_model()` |
| `app/models/schemas.py` | Валидаторы анкеты |
| `README.md` | Полная документация сервиса |
