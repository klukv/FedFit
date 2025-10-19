package repositories

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TrainingPlanWorkoutRepository struct {
	pool *pgxpool.Pool
}

func NewTrainingPlanWorkoutsRepository(pool *pgxpool.Pool) *TrainingPlanWorkoutRepository {
	return &TrainingPlanWorkoutRepository{pool: pool}
}

func (r *TrainingPlanWorkoutRepository) CreateTrainingPlanWorkoutTable(ctx context.Context) error {
	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS training_plan_workout (
		training_plan_id INTEGER REFERENCES training_plan(id) ON DELETE CASCADE,
		workout_id INTEGER REFERENCES workout(id) ON DELETE CASCADE,
		PRIMARY KEY (training_plan_id, workout_id),
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return fmt.Errorf("Создание таблицы связей тренировок и планов тренировок провалено", err)
	}
	return nil
}

func (r *TrainingPlanWorkoutRepository) CreateNewLinkTrainingPlanWorkout(ctx context.Context, training_plan_id string, workout_id string) error {
	query := `
		INSERT INTO training_plan_workout (training_plan_id, workout_id)
		VALUES ($1, $2)
	`

	if _, err := r.pool.Exec(ctx, query, training_plan_id, workout_id); err != nil {
		return err
	}

	return nil
}
