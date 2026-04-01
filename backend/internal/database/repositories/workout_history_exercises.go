package repositories

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkoutHistoryExercisesRepository struct {
	pool *pgxpool.Pool
}

func NewWorkoutHistoryExercisesRepository(pool *pgxpool.Pool) *WorkoutHistoryExercisesRepository {
	return &WorkoutHistoryExercisesRepository{pool: pool}
}

func (r *WorkoutHistoryExercisesRepository) CreateWorkoutHistoryExercisesTable(ctx context.Context) error {
	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS workout_history_exercises (
			workout_history_id INTEGER REFERENCES workout_history(id) ON DELETE CASCADE,
			exercise_id INTEGER REFERENCES exercise(id) ON DELETE CASCADE,
			PRIMARY KEY (workout_history_id, exercise_id),
			sets_done INT NOT NULL,
			reps_done INT NOT NULL,
			duration_done INT NOT NULL,
			calories_burned INT NOT NULL,
			is_completed BOOLEAN,
			created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
		)
	`); err != nil {
		return fmt.Errorf("Создание связующей таблицы истории тренировок и упражнений провалено")
	}
	return nil
}
