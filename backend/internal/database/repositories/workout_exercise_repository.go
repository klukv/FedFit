package repositories

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkoutExerciseRepository struct {
	pool *pgxpool.Pool
}

func NewWorkoutExerciseRepository(pool *pgxpool.Pool) *WorkoutExerciseRepository {
	return &WorkoutExerciseRepository{pool: pool}
}

func (r *WorkoutExerciseRepository) CreateWorkoutExerciseTable(ctx context.Context) error {
	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS workout_exercise (
		exercise_id INTEGER REFERENCES exercise(id) ON DELETE CASCADE,
		workout_id INTEGER REFERENCES workout(id) ON DELETE CASCADE,
		PRIMARY KEY (exercise_id, workout_id),
		sets INT,
		reps INT,
		duration INT,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return fmt.Errorf("Создание таблицы связи тренировок и упражнений провалено", err)
	}
	return nil
}
