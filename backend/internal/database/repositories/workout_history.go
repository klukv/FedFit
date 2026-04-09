package repositories

import (
	"FedFit/internal/models"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
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

func (r *WorkoutHistoryRepository) AddWorkoutToHistory(
	ctx context.Context,
	tx pgx.Tx,
	workout_id int,
	user_id int,
	workoutHistory models.WorkoutHistory,
) (int, error) {
	query := `
		INSERT INTO workout_history (user_id, workout_id, started_at, finished_at, total_calories, total_duration, is_completed)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`

	var historyId int

	err := tx.QueryRow(
		ctx,
		query,
		user_id,
		workout_id,
		workoutHistory.Started_at,
		workoutHistory.Finished_at,
		workoutHistory.Total_calories,
		workoutHistory.Total_duration,
		workoutHistory.Is_completed,
	).Scan(&historyId)

	if err != nil {
		return 0, fmt.Errorf("Добавление тренировку в историю провалена. Подробнее: %w", err)
	}

	return historyId, nil
}

func (r *WorkoutHistoryRepository) GetHistoryByUserId(ctx context.Context, tx pgx.Tx, userId int) ([]models.WorkoutHistory, error) {
	query := `SELECT
		wh.id,
		wh.started_at,
		wh.finished_at,
		wh.total_calories,
		wh.total_duration,
		wh.is_completed,
		wh.created_at,
		wh.updated_at
	FROM workout_history wh WHERE wh.user_id = $1`

	rows, err := tx.Query(ctx, query, userId)

	if err != nil {
		return nil, fmt.Errorf("Ошибка запроса истории для пользователя с id: %w.\nПодробнее: %w", userId, err)
	}

	defer rows.Close()

	var history []models.WorkoutHistory

	for rows.Next() {
		var workoutFromHistory models.WorkoutHistory

		if err := rows.Scan(
			&workoutFromHistory.Id,
			&workoutFromHistory.Started_at,
			&workoutFromHistory.Finished_at,
			&workoutFromHistory.Total_calories,
			&workoutFromHistory.Total_duration,
			&workoutFromHistory.Is_completed,
			&workoutFromHistory.CreatedAt,
			&workoutFromHistory.UpdatedAt,
		); err != nil {
			return nil, err
		}

		history = append(history, workoutFromHistory)
	}

	return history, nil
}
