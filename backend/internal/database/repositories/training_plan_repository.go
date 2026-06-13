package repositories

import (
	"FedFit/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
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
		user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return fmt.Errorf("Создание таблицы планок тренировок провалено")
	}

	if _, err := r.pool.Exec(ctx, `ALTER TABLE training_plan
		ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE`); err != nil {
		return fmt.Errorf("добавление колонки user_id в training_plan провалено: %w", err)
	}

	if _, err := r.pool.Exec(ctx, `CREATE INDEX IF NOT EXISTS idx_training_plan_user_id
		ON training_plan(user_id)`); err != nil {
		return fmt.Errorf("создание индекса idx_training_plan_user_id провалено: %w", err)
	}

	return nil
}

func (r *TrainingPlanRepository) CreateTrainingPlan(ctx context.Context, tx pgx.Tx, plan *models.TrainingPlan) (int, error) {
	query := `
		INSERT INTO training_plan (name, description)
		VALUES ($1, $2)
		RETURNING id, created_at, updated_at
	`

	if err := tx.QueryRow(
		ctx,
		query,
		plan.Name,
		plan.Description,
	).Scan(&plan.ID, &plan.CreatedAt, &plan.UpdatedAt); err != nil {
		log.Fatal(err)
		return 0, err
	}

	return plan.ID, nil
}

func (r *TrainingPlanRepository) GetCommonTrainingPlans(ctx context.Context) ([]models.TrainingPlans, error) {
	return r.getTrainingPlansByScope(ctx, "tp.user_id IS NULL")
}

func (r *TrainingPlanRepository) GetPersonalTrainingPlansByUserID(ctx context.Context, userID int) ([]models.TrainingPlans, error) {
	return r.getTrainingPlansByScope(ctx, "tp.user_id = $1", userID)
}

func (r *TrainingPlanRepository) getTrainingPlansByScope(ctx context.Context, whereClause string, args ...any) ([]models.TrainingPlans, error) {
	query := fmt.Sprintf(`SELECT
		tp.id,
		tp.name,
		tp.description,
		tp.created_at,
		tp.updated_at
	FROM training_plan tp
	WHERE %s
	ORDER BY tp.created_at DESC`, whereClause)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plans []models.TrainingPlans
	for rows.Next() {
		var plan models.TrainingPlans
		if err := rows.Scan(&plan.ID, &plan.Name, &plan.Description, &plan.CreatedAt, &plan.UpdatedAt); err != nil {
			return nil, err
		}
		plans = append(plans, plan)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(plans) != 0 {
		return plans, nil
	}

	return []models.TrainingPlans{}, nil
}

func (r *TrainingPlanRepository) GetAllTrainingPlans(ctx context.Context) ([]models.TrainingPlans, error) {
	return r.GetCommonTrainingPlans(ctx)
}

func (r *TrainingPlanRepository) GetTrainingPlan(ctx context.Context, tpId int) (models.TrainingPlan, error) {
	query := `SELECT
		tp.id,
		tp.name,
		tp.description,
		tp.created_at,
		tp.updated_at,
		COALESCE(
			(
				SELECT json_agg(
					json_build_object(
						'id', w.id,
						'name', w.name,
						'value', w.value,
						'description', w.description,
						'image', w.image,
						'level', w.level,
						'caloriesMin', w.calories_min,
						'caloriesMax', w.calories_max,
						'duration', w.duration,
						'exercisesCount', (SELECT COUNT(*)::int FROM workout_exercise we WHERE we.workout_id = w.id),
						'exercises', COALESCE(
							(
								SELECT json_agg(
									json_build_object(
										'id', e.id,
										'name', e.name,
										'description', e.description,
										'icon', e.icon,
										'sets', we.sets,
										'reps', we.reps,
										'duration', we.duration
									) ORDER BY we.exercise_id
								)
								FROM workout_exercise we
								JOIN exercise e ON e.id = we.exercise_id
								WHERE we.workout_id = w.id
							),
							'[]'::json
						)
					)
				)
				FROM workout w
				JOIN training_plan_workout tpw ON w.id = tpw.workout_id
				WHERE tpw.training_plan_id = tp.id
			),
			'[]'::json
		) AS workouts
	FROM training_plan tp
	WHERE tp.id = $1`

	var plan models.TrainingPlan
	var workoutsJSON []byte

	if err := r.pool.QueryRow(ctx, query, tpId).Scan(&plan.ID, &plan.Name, &plan.Description, &plan.CreatedAt, &plan.UpdatedAt, &workoutsJSON); err != nil {
		return models.TrainingPlan{}, err
	}

	if len(workoutsJSON) > 0 {
		if err := json.Unmarshal(workoutsJSON, &plan.Workouts); err != nil {
			return models.TrainingPlan{}, fmt.Errorf("разбор workouts JSON: %w", err)
		}
	}

	return plan, nil
}
