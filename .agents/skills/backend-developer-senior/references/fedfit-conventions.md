# Конвенции проекта FedFit (backend)

## Стек

- **Go 1.25** — модуль `FedFit` в `backend/go.mod`
- **stdlib** — `net/http` с Go 1.22+ route patterns; без внешнего роутера
- **PostgreSQL** — драйвер `github.com/jackc/pgx/v5`
- **Конфиг БД** — `configs/config.db.go`
- **Логирование** — стандартный `log` (пока без structured logger)

## Расположение в монорепозитории

```
FedFit/
├── backend/                # Go REST API (порт 8000 по умолчанию)
├── recomm_system/          # Python FastAPI — рекомендации (порт 8001)
└── frontend/               # Next.js — клиент API
```

## Слои и ответственность

```
HTTP Request
     │
     ▼
handlers/     # парсинг path/query/body, статус-коды, json.Encode
     │
     ▼
services/     # бизнес-логика, оркестрация, транзакции (pgx.Tx)
     │
     ▼
repositories/ # SQL, маппинг в models
     │
     ▼
PostgreSQL
```

**clients/** — исходящие HTTP-вызовы (например, `RecommendationClient` → `POST {baseUrl}/recommend`).

## Точка входа и DI

```go
// cmd/app/main.go
app := app.InitApp()                    // pool, repos, services
mux := api.Routes(app.Repositories, app.Services)
handler := middlewares.CORS(allowed)(mux)
http.Server{ Addr: ":8000", Handler: handler }
```

`app.InitApp()`:
1. `database.ConnectToDB(ctx)` → `*pgxpool.Pool`
2. `repositories.InitRepositories(pool, ctx)` — создание таблиц при старте
3. `clients.InitClients()` — внешние сервисы
4. `services.InitServices(pool, repos, clients)`

## API-маршруты (`internal/api/routes.go`)

| Метод | Путь | Handler |
|---|---|---|
| GET | `/v1/training-plans` | GetTrainingPlansHandler |
| GET | `/v1/training-plans/{id}` | GetTrainingPlanHandler |
| POST | `/v1/training-plans` | CreateTrainingPlanHandler |
| POST | `/v1/training-plans/recommendation` | GetRecommendationTrainingPlan |
| GET | `/v1/workouts` | GetWorkoutsHandler |
| GET | `/v1/workouts/{id}` | GetWorkout |
| POST | `/v1/workouts` | CreateWorkoutsHandler |
| POST | `/v1/add-workout-to-tp/{training_plan_id}/{workout_id}` | AddWorkoutToTrainingPlan |
| GET | `/v1/workouts/history/{user_id}` | GetHistoryByUserId |
| POST | `/v1/workouts/history/{id}/{user_id}` | AddWorkoutToHistory |
| PUT | `/v1/workouts/history/{workout_history_id}` | UpdateWorkoutHistory |

Новые маршруты регистрируй в `routes.go`, хендлер — в `handlers/`.

## Паттерн handler

```go
func (h *Handler) GetSomething(w http.ResponseWriter, r *http.Request) {
    id := r.PathValue("id")
    // валидация → вызов service или repository
    // errors.Is(err, pgx.ErrNoRows) → 404
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(result)
}
```

Ошибки клиенту: `http.Error(w, msg, status)` или `utils.ResErrorJson(w, msg, status)`.

## Паттерн service с транзакцией

Эталон — `TrainingPlanService.CreateTrainingPlan`:

```go
tx, err := s.pool.Begin(ctx)
defer tx.Rollback(ctx)  // no-op после Commit

// несколько операций через repos с передачей tx
if err := s.repos.SomeRepo.Create(ctx, tx, entity); err != nil {
    return fmt.Errorf("...")
}
return tx.Commit(ctx)
```

Опции транзакции для вложенных вызовов — см. `WithTx(tx)` в `WorkoutService`.

## Паттерн repository

- Структура с полем `pool *pgxpool.Pool`
- Методы принимают `context.Context`
- Мутации в транзакции принимают `pgx.Tx`
- `CREATE TABLE IF NOT EXISTS` — в `InitRepositories` при старте (MVP-подход; для продакшена — отдельные миграции)

## Модели (`internal/models/`)

| Файл | Сущности |
|---|---|
| `training_plan.go` | `TrainingPlan`, `TrainingPlans` |
| `workout.go` | `Workout`, упражнения в тренировке |
| `history.go` | история тренировок пользователя |
| `recommendation.go` | `SurveyResult` — вход для recomm_system |

JSON-теги в snake_case для совместимости с frontend и Python-сервисом.

## Интеграция с recomm_system

```
Frontend  →  POST /v1/training-plans/recommendation  →  Go handler
     →  RecommendationService  →  RecommendationClient
     →  POST http://localhost:8001/recommend  →  FastAPI
```

`SurveyResult` в Go должен совпадать с `UserQuestionnaire` в Pydantic. Ответ маппится на `models.TrainingPlan`.

## CORS

`middlewares/cors.go` — whitelist origins. Для локальной разработки: `http://localhost:3000`.

## Запуск

```bash
cd backend
go run ./cmd/app
# или с флагами:
go run ./cmd/app -port=8000 -env=development
```

Требуется запущенный PostgreSQL (см. `configs/config.db.go` и `scripts/seed.sql`).

## Существующие файлы (ориентиры для паттернов)

| Область | Что смотреть |
|---|---|
| CRUD плана | `handlers/trainingPlan.go`, `services/trainingPlanService.go`, `repositories/training_plan_repository.go` |
| Рекомендации | `handlers/recommendation.go`, `services/recommendationService.go`, `clients/recommendationClient.go` |
| История | `handlers/history.go`, `services/workoutHistoryService.go` |
| HTTP-утилиты | `utils/http.go`, `utils/datetime.go` |

## Известные ограничения MVP

- Таблицы создаются при старте, не через migrate-инструмент
- Часть handlers обращается к repository напрямую (для нового кода предпочитай service-слой)
- `log.Fatal` в некоторых местах при ошибках — при рефакторинге заменяй на возврат ошибки наверх
