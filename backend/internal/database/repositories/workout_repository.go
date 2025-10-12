package repositories

import (
	"FedFit/internal/models"
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkoutRepository struct {
	pool *pgxpool.Pool
}

func NewWorkoutRepository(pool *pgxpool.Pool) *WorkoutRepository {
	return &WorkoutRepository{pool: pool}
}

func (r *WorkoutRepository) CreateWorkoutTable(ctx context.Context) error {
	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS workout (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		value VARCHAR(255) NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return fmt.Errorf("Создание таблицы планок тренировок провалено")
	}
	return nil
}

func (r *WorkoutRepository) CreateWorkout(ctx context.Context, workout *models.Workout) error {
	query := `
		INSERT INTO workout (name, value)
		VALUES ($1, $2)
		RETURNING id, created_at, updated_at
	`

	if err := r.pool.QueryRow(
		ctx,
		query,
		workout.Name,
		workout.Value,
	).Scan(&workout.ID, &workout.CreatedAt, &workout.UpdatedAt); err != nil {
		log.Fatal(err)
		return err
	}

	return nil
}
