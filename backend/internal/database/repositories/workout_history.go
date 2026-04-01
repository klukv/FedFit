package repositories

import (
	"FedFit/internal/models"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkoutHistoryRepository struct {
	pool *pgxpool.Pool
}

func NewWorkoutHistoryRepository(pool *pgxpool.Pool) *WorkoutHistoryRepository {
	return &WorkoutHistoryRepository{pool: pool}
}

func (r *WorkoutHistoryRepository) CreateWorkoutHistoryTable(ctx context.Context) error {
	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS workout_history (
			id SERIAL PRIMARY KEY,
			user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
			workout_id INTEGER REFERENCES workout(id) ON DELETE CASCADE,
			UNIQUE (user_id, workout_id),
			started_at TIMESTAMP NOT NULL,
			finished_at TIMESTAMP NOT NULL,
			total_calories INT NOT NULL,
			total_duration INT NOT NULL,
			is_completed BOOLEAN,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`); err != nil {
		return fmt.Errorf("Создание таблицы истории тренировок провалено")
	}
	return nil
}

func (r *WorkoutHistoryRepository) AddWorkoutToHistory(ctx context.Context, workout_id string, user_id string, workoutHistory models.Workout_History) error {
	query := `
		INSERT INTO workout_history (user_id, workout_id, started_at, finished_at, total_calories, total_duration, is_completed)
		values ($1, $2, $3, $4, $5, $6, $7)
	`

	if _, err := r.pool.Exec(
		ctx,
		query,
		user_id,
		workout_id,
		workoutHistory.Started_at,
		workoutHistory.Finished_at,
		workoutHistory.Total_calories,
		workoutHistory.Total_duration,
		workoutHistory.Is_completed,
	); err != nil {
		return err
	}

	return nil
}
