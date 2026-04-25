package repositories

import (
	"FedFit/internal/models"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
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
			id SERIAL PRIMARY KEY,
			workout_history_id INTEGER REFERENCES workout_history(id) ON DELETE CASCADE,
			exercise_id INTEGER REFERENCES exercise(id) ON DELETE CASCADE,
			UNIQUE (workout_history_id, exercise_id),
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

func (r *WorkoutHistoryExercisesRepository) AddWorkoutHistoryExercises(
	ctx context.Context,
	tx pgx.Tx,
	workoutHistoryId int,
	exercisesIds []models.WHExercisesDTO,
) error {
	query := `INSERT INTO workout_history_exercises (
			workout_history_id,
			exercise_id,
			sets_done,
			reps_done,
			duration_done,
			calories_burned,
			is_completed
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	for _, exercises := range exercisesIds {
		if _, err := tx.Exec(
			ctx,
			query,
			workoutHistoryId,
			exercises.Id,
			exercises.SetsDone,
			exercises.RepsDone,
			exercises.DurationDone,
			exercises.CaloriesBurned,
			exercises.IsCompleted,
		); err != nil {
			return fmt.Errorf(
				"Добавление связи между тренировкой и упражнениями в связующую таблицу провалено. Подробнее: %w",
				err,
			)
		}
	}

	return nil
}

func (r *WorkoutHistoryExercisesRepository) GetExercisesWorkoutHistoryByUserId(ctx context.Context, tx pgx.Tx, workoutHistoryId int) ([]models.WHExercisesDTO, error) {
	query := `SELECT
		whe.exercise_id,
		whe.sets_done,
		whe.reps_done,
		whe.duration_done,
		whe.calories_burned,
		whe.is_completed
	FROM workout_history_exercises whe WHERE whe.workout_history_id = $1`

	rows, err := tx.Query(ctx, query, workoutHistoryId)

	if err != nil {
		return nil, fmt.Errorf(
			"Ошибка запроса упражнений в тренировке (история). Подробнее: %w",
			err,
		)
	}

	var workoutsExercises []models.WHExercisesDTO

	for rows.Next() {
		var workoutExercises models.WHExercisesDTO

		if err := rows.Scan(
			&workoutExercises.Id,
			&workoutExercises.SetsDone,
			&workoutExercises.RepsDone,
			&workoutExercises.DurationDone,
			&workoutExercises.CaloriesBurned,
			&workoutExercises.IsCompleted,
		); err != nil {
			return nil, err
		}
		workoutsExercises = append(workoutsExercises, workoutExercises)
	}
	return workoutsExercises, nil
}

func (r *WorkoutHistoryExercisesRepository) UpdateWorkoutHistoryExercises(
	ctx context.Context,
	tx pgx.Tx,
	workoutHistoryId int,
	exercises []models.WHExercisesDTO,
) error {
	query := `UPDATE workout_history_exercises
			SET sets_done = $2,
			reps_done = $3,
			duration_done = $4,
			calories_burned = $5,
			is_completed = $6
			WHERE workout_history_id = $1 AND exercise_id = $7
	`

	for _, exercise := range exercises {
		if _, err := tx.Exec(
			ctx,
			query,
			workoutHistoryId,
			exercise.SetsDone,
			exercise.RepsDone,
			exercise.DurationDone,
			exercise.CaloriesBurned,
			exercise.IsCompleted,
			exercise.Id,
		); err != nil {
			return fmt.Errorf(
				"Обновление информации между тренировкой и упражнениями в связующую таблицу провалено. Подробнее: %w",
				err,
			)
		}
	}

	return nil
}
