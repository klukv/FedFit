package repositories

import (
	"FedFit/internal/models"
	"context"
	"encoding/json"
	"fmt"

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
		description TEXT,
		image TEXT,
		level VARCHAR(255) NOT NULL,
		calories_min INT NOT NULL,
		calories_max INT NOT NULL,
		duration INT,
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
		return err
	}

	return nil
}

func (r *WorkoutRepository) GetAllWorkouts(ctx context.Context) ([]models.Workout, error) {
	query := `SELECT * FROM workout ORDER BY created_at DESC`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var workouts []models.Workout
	for rows.Next() {
		var plan models.Workout
		if err := rows.Scan(&plan.ID, &plan.Name, &plan.Value, &plan.CreatedAt, &plan.UpdatedAt); err != nil {
			return nil, err
		}
		workouts = append(workouts, plan)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return workouts, nil
}

func (r *WorkoutRepository) GetWorkout(ctx context.Context, workoutId int) (models.WorkoutDetail, error) {
	query := `SELECT
		w.id,
		w.name,
		w.description,
		w.image,
		w.level,
		w.calories_min,
		w.calories_max,
		w.duration,
		(SELECT COUNT(*) FROM workout_exercise we WHERE we.workout_id = w.id) AS "exercisesCount",
		COALESCE(
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
		) AS exercises
	FROM workout w WHERE w.id = $1`

	var workout models.WorkoutDetail
	var exercisesJSON []byte

	if err := r.pool.QueryRow(ctx, query, workoutId).Scan(
		&workout.ID,
		&workout.Name,
		&workout.Description,
		&workout.Image,
		&workout.Level,
		&workout.Calories_min,
		&workout.Calories_max,
		&workout.Duration,
		&workout.ExercisesCount,
		&exercisesJSON,
	); err != nil {
		return models.WorkoutDetail{}, err
	}

	if len(exercisesJSON) > 0 {
		json.Unmarshal(exercisesJSON, &workout.Exercises)
	}

	return workout, nil
}
