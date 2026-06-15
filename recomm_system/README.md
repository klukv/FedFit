# Fitness Recommendation Service

Микросервис генерации персонализированных планов тренировок для FedFit.

## Архитектура (v2 — гибрид rule-based + ML)

```
POST /recommend
       │
       ▼
┌─────────────────┐
│   Rule Engine   │  Слоты плана, hard constraints (инвентарь, ограничения, уровень)
└────────┬────────┘
         │ workout_slots + available_exercises
         ▼
   Для каждого слота:
         │
    ┌────┴────┐
    ▼         ▼
┌──────────┐ ┌──────────────────┐
│ Workout  │ │ Exercise Composer │  ML ранжирует упражнения → сборка (id=0)
│ Matcher  │ │  (ML Selector)    │
│ (rules)  │ └────────┬─────────┘
└────┬─────┘          │
     │ catalog        │ generated / catalog_by_signature
     └────────┬───────┘
              ▼
     ┌─────────────────┐
     │ Plan Assembler  │  TrainingPlanResponse
     └─────────────────┘
```

**Rules** — безопасность, доступность, экспертный подбор готовых тренировок из каталога.  
**ML** — ранжирование упражнений внутри допустимого пула, обучение на составах `workout_exercise` из БД.

---

## Структура проекта

```
recomm_system/
├── app/
│   ├── main.py                      # FastAPI: /recommend, /health, /retrain
│   ├── models/                      # Pydantic-схемы и enums
│   ├── services/
│   │   ├── catalog_loader.py        # Загрузка catalog.json
│   │   ├── catalog_convert.py       # Нормализация ответа бэкенда
│   │   ├── rule_engine.py           # Фильтрация, слоты
│   │   ├── workout_matcher.py       # Экспертные правила для каталога
│   │   ├── exercise_composer.py     # ML + сборка тренировки
│   │   ├── plan_assembler.py        # Контракт API
│   │   ├── recommendation_service.py
│   │   └── ml_selector.py           # sklearn ранжирование + fallback
│   ├── ml/
│   │   ├── catalog_training.py      # Обучение на каталоге БД
│   │   ├── pipeline.py
│   │   └── features.py
│   └── data/
│       ├── catalog.json             # Полный snapshot (приоритет)
│       ├── exercises.json
│       ├── workouts.json
│       └── templates.json
├── scripts/
│   └── export_catalog.py            # GET /v1/internal/catalog/export → JSON
├── models/
│   └── exercise_selector.pkl
├── tests/
│   └── test_recommendation.py
└── requirements.txt
```

---

## Быстрый старт

```bash
cd recomm_system
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

При первом запуске модель обучается на каталоге (+ expert augmentation при n < 500).

---

## Синхронизация с БД

Конвертация данных выполняется **на стороне recomm_system**:

```bash
# Бэкенд должен быть запущен
python scripts/export_catalog.py
# или
python scripts/export_catalog.py --url http://localhost:8000/v1/internal/catalog/export

curl -X POST http://localhost:8001/retrain
```

Скрипт записывает `catalog.json`, `exercises.json`, `workouts.json`.

---

## API

### POST /recommend

Вход — `UserQuestionnaire` (совпадает с Go `SurveyResult`).

Источники слотов (в логах):
- `catalog` — готовая тренировка из БД (id > 0)
- `generated` — собрана ML из упражнений (id = 0)
- `catalog_by_signature` — состав совпал с каталогом

### POST /retrain

Переобучение на каталоге. Ответ включает метрики:

```json
{
  "status": "ok",
  "metrics": {
    "n_samples": 500,
    "catalog_ratio": 0.156,
    "augmented": true,
    "train_r2": 0.89
  }
}
```

### GET /health

Статус компонентов и размер каталога.

---

## Обучение ML

1. **Каталог** — для каждой workout выводится типичный профиль (`infer_profile_from_workout`)
2. **Позитивы** (y=1.0) — упражнения из `workout_exercise`
3. **Негативы** (y=0.0–0.3) — другие упражнения с соблюдением hard constraints
4. **Augmentation** — при n_samples < 500 дополняется expert rules (`_generate_synthetic_data`)
5. **Fallback** — при пустом каталоге полностью синтетика

---

## Тесты

```bash
pip install pytest
pytest tests/ -v
```

---

## Производительность

- Inference: < 2 с при 50+ workouts в каталоге
- Модель кэшируется в памяти при старте
