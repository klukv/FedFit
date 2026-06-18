package repositories

import (
	"FedFit/internal/models"
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
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
		muscle_groups JSONB NOT NULL DEFAULT '[]',
		created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	)`); err != nil {
		return fmt.Errorf("создание таблицы планок тренировок провалено")
	}

	if _, err := r.pool.Exec(ctx, `ALTER TABLE workout
		ADD COLUMN IF NOT EXISTS muscle_groups JSONB NOT NULL DEFAULT '[]'`); err != nil {
		return fmt.Errorf("добавление колонки muscle_groups в workout провалено: %w", err)
	}

	return nil
}

func (r *WorkoutRepository) WorkoutValueExists(ctx context.Context, tx pgx.Tx, value string) (bool, error) {
	var exists bool
	err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM workout WHERE value = $1)`, value).Scan(&exists)
	return exists, err
}

func (r *WorkoutRepository) GetWorkoutIDByValue(ctx context.Context, tx pgx.Tx, value string) (int, error) {
	var id int
	err := tx.QueryRow(ctx, `SELECT id FROM workout WHERE value = $1`, value).Scan(&id)
	if errors.Is(err, pgx.ErrNoRows) {
		return 0, nil
	}
	return id, err
}

func (r *WorkoutRepository) CreateWorkout(ctx context.Context, tx pgx.Tx, workout *models.Workout) (int, error) {
	query := `
		INSERT INTO workout (name, value, description, image, level, calories_min, calories_max, duration)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`

	if err := tx.QueryRow(
		ctx,
		query,
		workout.Name,
		workout.Value,
		workout.Description,
		workout.Image,
		workout.Level,
		workout.Calories_min,
		workout.Calories_max,
		workout.Duration,
	).Scan(&workout.ID, &workout.CreatedAt, &workout.UpdatedAt); err != nil {
		return 0, err
	}

	return workout.ID, nil
}

func (r *WorkoutRepository) GetAllWorkouts(ctx context.Context) ([]models.Workout, error) {
	query := `SELECT
		w.id,
		w.name,
		w.value,
		w.description,
		w.image,
		w.level,
		w.calories_min,
		w.calories_max,
		w.duration,
		(SELECT COUNT(*)::int FROM workout_exercise we WHERE we.workout_id = w.id) AS exercises_count,
		w.created_at,
		w.updated_at
	FROM workout w
	ORDER BY w.created_at DESC`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var workouts []models.Workout
	for rows.Next() {
		var plan models.Workout
		if err := rows.Scan(
			&plan.ID,
			&plan.Name,
			&plan.Value,
			&plan.Description,
			&plan.Image,
			&plan.Level,
			&plan.Calories_min,
			&plan.Calories_max,
			&plan.Duration,
			&plan.ExercisesCount,
			&plan.CreatedAt,
			&plan.UpdatedAt,
		); err != nil {
			return nil, err
		}
		workouts = append(workouts, plan)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return workouts, nil
}

func (r *WorkoutRepository) GetWorkout(ctx context.Context, workoutId string) (*models.Workout, error) {
	query := `SELECT
		w.id,
		w.name,
		w.value,
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

	var workout models.Workout
	var exercisesJSON []byte

	if err := r.pool.QueryRow(ctx, query, workoutId).Scan(
		&workout.ID,
		&workout.Name,
		&workout.Value,
		&workout.Description,
		&workout.Image,
		&workout.Level,
		&workout.Calories_min,
		&workout.Calories_max,
		&workout.Duration,
		&workout.ExercisesCount,
		&exercisesJSON,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}

	if len(exercisesJSON) > 0 {
		json.Unmarshal(exercisesJSON, &workout.Exercises)
	}

	return &workout, nil
}

func (r *WorkoutRepository) GetAllWithExercises(ctx context.Context) ([]models.CatalogWorkout, error) {
	query := `SELECT
		w.id,
		w.name,
		w.value,
		w.description,
		w.image,
		w.level,
		w.calories_min,
		w.calories_max,
		w.duration,
		w.muscle_groups,
		COALESCE(
			(
				SELECT json_agg(
					json_build_object(
						'exercise_id', we.exercise_id,
						'sets', we.sets,
						'reps', we.reps,
						'duration', we.duration
					) ORDER BY we.exercise_id
				)
				FROM workout_exercise we
				WHERE we.workout_id = w.id
			),
			'[]'::json
		) AS exercises
	FROM workout w
	ORDER BY w.id`

	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var workouts []models.CatalogWorkout
	for rows.Next() {
		var w models.CatalogWorkout
		var exercisesJSON []byte

		if err := rows.Scan(
			&w.ID,
			&w.Name,
			&w.Value,
			&w.Description,
			&w.Image,
			&w.Level,
			&w.CaloriesMin,
			&w.CaloriesMax,
			&w.Duration,
			&w.MuscleGroups,
			&exercisesJSON,
		); err != nil {
			return nil, err
		}

		if len(exercisesJSON) > 0 {
			if err := json.Unmarshal(exercisesJSON, &w.Exercises); err != nil {
				return nil, fmt.Errorf("разбор exercises JSON для workout %d: %w", w.ID, err)
			}
		}

		workouts = append(workouts, w)
	}

	return workouts, rows.Err()
}
