# Fitness Recommendation Service

Микросервис генерации персонализированных планов тренировок для фитнес-приложения.

## Архитектура

Сервис реализует **гибридный подход** к рекомендациям:

```
POST /recommend
       │
       ▼
┌─────────────────┐
│   Rule Engine   │  ← Фильтрация по инвентарю,
│  (rule_engine)  │    ограничениям, уровню.
│                 │    Строит структуру плана.
└────────┬────────┘
         │ filtered exercises + workout slots
         ▼
┌─────────────────┐
│   ML Selector   │  ← sklearn Pipeline ранжирует
│  (ml_selector)  │    упражнения и выбирает лучшие
│                 │    для каждой тренировки.
└────────┬────────┘
         │ slot → [exercises]
         ▼
┌─────────────────┐
│  Plan Builder   │  ← Формирует финальный JSON
│  (plan_builder) │    с параметрами (сеты, повторения).
└────────┬────────┘
         │
         ▼
  WorkoutPlanResponse (JSON)
```

**Rule Engine** задаёт жёсткие ограничения (безопасность, доступность инвентаря).
**ML Selector** оптимизирует выбор внутри допустимого пространства.
При отсутствии ML-модели сервис автоматически переключается на детерминированный fallback.

---

## Структура проекта

```
recommendation_service/
├── app/
│   ├── main.py                  # FastAPI: эндпоинты /recommend, /health, /retrain
│   ├── models/
│   │   ├── enums.py             # Enum: Goal, Level, Equipment, Restriction
│   │   ├── schemas.py           # Pydantic: UserQuestionnaire (входная модель)
│   │   └── plan_structures.py   # Pydantic: WorkoutPlanResponse (выходная модель)
│   ├── services/
│   │   ├── rule_engine.py       # Фильтрация упражнений, построение слотов
│   │   ├── ml_selector.py       # ML-ранжирование и выбор упражнений
│   │   └── plan_builder.py      # Сборка итогового JSON-плана
│   ├── data/
│   │   ├── exercises.json       # База упражнений (38 упражнений)
│   │   └── templates.json       # Шаблоны планов по целям
│   └── ml/
│       ├── features.py          # Генерация признаков для ML
│       └── pipeline.py          # Обучение/загрузка sklearn Pipeline
├── models/
│   └── exercise_selector.pkl    # Сохранённая ML-модель (создаётся при первом запуске)
├── requirements.txt
└── README.md
```

---

## Быстрый старт

### 1. Установка зависимостей

```bash
cd recommendation_service
python -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Запуск сервиса

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

При **первом запуске** сервис автоматически обучит ML-модель на синтетических данных
(занимает ~5-10 секунд). Модель сохраняется в `models/exercise_selector.pkl`
и при следующих запусках загружается быстро.

### 3. Проверка работоспособности

```bash
curl http://localhost:8001/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "components": {
    "rule_engine": true,
    "ml_selector": true,
    "ml_model_loaded": true,
    "plan_builder": true
  },
  "recommendation_mode": "hybrid"
}
```

### 4. Swagger UI

Откройте в браузере: **http://localhost:8001/docs**

---

## API Reference

### POST /recommend

Генерирует персональный план тренировок.

#### Входной JSON (UserQuestionnaire)

```json
{
  "goal": "weight_loss",
  "level": "intermediate",
  "equipment": ["dumbbells", "pullup_bar"],
  "frequency": 3,
  "duration_preference": 45,
  "restrictions": ["knee"]
}
```

| Поле | Тип | Допустимые значения | Описание |
|------|-----|---------------------|----------|
| `goal` | string | `weight_loss`, `muscle_gain`, `endurance`, `general_fitness` | Цель тренировок |
| `level` | string | `beginner`, `intermediate`, `advanced` | Уровень подготовки |
| `equipment` | array | `none`, `dumbbells`, `barbell`, `pullup_bar`, `kettlebell` | Доступный инвентарь |
| `frequency` | int | 1–7 | Тренировок в неделю |
| `duration_preference` | int | `15`, `30`, `45`, `60` | Длительность в минутах |
| `restrictions` | array | `knee`, `back`, `shoulder` | Ограничения здоровья (можно пустой `[]`) |

#### Выходной JSON (WorkoutPlanResponse)

```json
{
  "name": "План для похудения — Средний",
  "description": "Высокоинтенсивный план с упором на кардио и круговые тренировки...",
  "level": "intermediate",
  "weekly_frequency": 3,
  "estimated_weekly_calories": 1150.5,
  "recommendation_source": "hybrid",
  "workouts": [
    {
      "name": "День 1: Кардио + Кор",
      "description": "Тренировка на кардио, пресс и кор. Примерное время: 45 мин.",
      "order_index": 1,
      "estimated_time": 45,
      "exercises": [
        {
          "exercise_id": 1,
          "name": "Прыжки на месте (Джампинг Джек)",
          "description": "Встаньте прямо, ноги вместе...",
          "muscle_group": "cardio",
          "order_index": 1,
          "sets": 3,
          "reps": 30,
          "duration": null,
          "calories_per_set": 15.0
        }
      ]
    }
  ]
}
```

### GET /health

Проверка состояния сервиса. Используется системами мониторинга.

### POST /retrain

Принудительное переобучение ML-модели.
> ⚠️ В продакшн защитите этот эндпоинт аутентификацией.

---

## Пример использования (Python)

```python
import httpx

questionnaire = {
    "goal": "muscle_gain",
    "level": "beginner",
    "equipment": ["dumbbells"],
    "frequency": 3,
    "duration_preference": 45,
    "restrictions": []
}

response = httpx.post("http://localhost:8001/recommend", json=questionnaire)
plan = response.json()

print(f"План: {plan['name']}")
for workout in plan['workouts']:
    print(f"\n  {workout['name']} ({workout['estimated_time']} мин)")
    for ex in workout['exercises']:
        params = f"{ex['sets']}x{ex['reps']}" if ex['reps'] else f"{ex['sets']}x{ex['duration']}с"
        print(f"    - {ex['name']}: {params}")
```

---

## Как работает гибридная логика

### Rule Engine (правила)

Выполняет **обязательные** ограничения:

1. **Фильтрация по инвентарю**: упражнение включается только если у пользователя есть нужный инвентарь
2. **Фильтрация по ограничениям**: упражнения с пометкой `restrictions_excluded: ["knee"]` исключаются при `restrictions: ["knee"]`
3. **Фильтрация по уровню**: начинающий не получает упражнения уровня `advanced`
4. **Параметры тренировки**: сеты/повторения задаются на основе цели (похудение → 15-20 повторений, набор массы → 6-12)
5. **Структура плана**: определяет N тренировок и целевые группы мышц для каждой

### ML Selector (машинное обучение)

Выполняет **оптимизацию** внутри отфильтрованного пула:

1. Преобразует анкету в числовой вектор (12 признаков)
2. Для каждого упражнения вычисляет скор совместимости (0–1)
3. Выбирает топ-N упражнений для каждой тренировки
4. Обеспечивает разнообразие (не более 2 упражнений на одну группу мышц)

### ML-модель

- **Алгоритм**: `GradientBoostingRegressor` внутри `sklearn.Pipeline`
- **Предобработка**: `StandardScaler` (нормализация признаков)
- **Обучение**: синтетические данные, сгенерированные по экспертным правилам
- **Сохранение**: `joblib` (`models/exercise_selector.pkl`)

---

## Переобучение ML-модели

### Вариант 1: При запуске (принудительно)

```python
# В app/services/ml_selector.py, строка инициализации:
ml_selector = MLSelector(force_retrain=True)
```

### Вариант 2: Через API

```bash
curl -X POST http://localhost:8001/retrain
```

### Вариант 3: С реальными данными (рекомендуется для продакшн)

Когда накопятся данные о выполненных планах, замените функцию
`_generate_synthetic_data` в `app/ml/pipeline.py` на загрузку реальных данных:

```python
# Формат обучающих данных:
# X: матрица признаков (профиль пользователя + характеристики упражнения)
# y: оценка пользователя (например, процент выполнения упражнения / рейтинг)
```

---

## Расширение базы упражнений

Отредактируйте `app/data/exercises.json`. Каждое упражнение:

```json
{
  "id": 39,
  "name": "Название упражнения",
  "description": "Описание техники",
  "muscle_group": "chest",
  "sets": 3,
  "reps": 12,
  "duration": null,
  "calories_per_set": 10.0,
  "equipment": ["dumbbells"],
  "restrictions_excluded": ["shoulder"],
  "level": ["intermediate", "advanced"]
}
```

После добавления упражнений рекомендуется переобучить модель (`POST /retrain`).

---

## Производительность

- Среднее время ответа: **< 100 мс** (модель в памяти)
- Первый запуск (обучение модели): **~10 секунд**
- Потребление памяти: **~50 МБ** (модель + кэш упражнений)
