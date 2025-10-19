package repositories

import (
	"FedFit/internal/models"
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TrainingPlanRepository struct {
	pool *pgxpool.Pool
}

func NewTrainingPlanRepository(pool *pgxpool.Pool) *TrainingPlanRepository {
	return &TrainingPlanRepository{pool: pool}
}

func (r *TrainingPlanRepository) CreateTrainingPlanTable(ctx context.Context) error {
	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS training_plan (
		id SERIAL PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		description TEXT NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return fmt.Errorf("Создание таблицы планок тренировок провалено")
	}
	return nil
}

func (r *TrainingPlanRepository) CreateTrainingPlan(ctx context.Context, plan *models.TrainingPlan) error {
	query := `
		INSERT INTO training_plan (name, description)
		VALUES ($1, $2)
		RETURNING id, created_at, updated_at
	`

	if err := r.pool.QueryRow(
		ctx,
		query,
		plan.Name,
		plan.Description,
	).Scan(&plan.ID, &plan.CreatedAt, &plan.UpdatedAt); err != nil {
		log.Fatal(err)
		return err
	}

	return nil
}

func (r *TrainingPlanRepository) GetAllTrainingPlans(ctx context.Context) ([]models.TrainingPlan, error) {
	query := `SELECT id, name, description, created_at, updated_at FROM training_plan ORDER BY created_at DESC`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plans []models.TrainingPlan
	for rows.Next() {
		var plan models.TrainingPlan
		if err := rows.Scan(&plan.ID, &plan.Name, &plan.Description, &plan.CreatedAt, &plan.UpdatedAt); err != nil {
			return nil, err
		}
		plans = append(plans, plan)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return plans, nil
}
