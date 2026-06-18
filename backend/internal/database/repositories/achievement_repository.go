package repositories

import (
	"FedFit/internal/models"
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AchievementRepository struct {
	pool *pgxpool.Pool
}

func NewAchievementRepository(pool *pgxpool.Pool) *AchievementRepository {
	return &AchievementRepository{pool: pool}
}

func (r *AchievementRepository) CreateAchievementTable(ctx context.Context) error {
	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS achievement (
		id SERIAL PRIMARY KEY,
		code VARCHAR(64) NOT NULL UNIQUE,
		title VARCHAR(255) NOT NULL,
		description TEXT NOT NULL,
		sort_order INT NOT NULL DEFAULT 0
	)`); err != nil {
		return fmt.Errorf("создание таблицы achievement провалено: %w", err)
	}
	return nil
}

func (r *AchievementRepository) CreateUserAchievementTable(ctx context.Context) error {
	if _, err := r.pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS user_achievement (
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		achievement_id INTEGER NOT NULL REFERENCES achievement(id) ON DELETE CASCADE,
		unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (user_id, achievement_id)
	)`); err != nil {
		return fmt.Errorf("создание таблицы user_achievement провалено: %w", err)
	}
	return nil
}

func (r *AchievementRepository) SeedAchievements(ctx context.Context) error {
	query := `
		INSERT INTO achievement (code, title, description, sort_order) VALUES
			('first_workout', 'Первая тренировка', 'Завершите свою первую тренировку', 1),
			('first_plan', 'Первый план', 'Создайте свой первый персональный план тренировок', 2),
			('first_calories', 'Сожжённые калории', 'Сожгите калории на завершённой тренировке', 3)
		ON CONFLICT (code) DO NOTHING
	`
	if _, err := r.pool.Exec(ctx, query); err != nil {
		return fmt.Errorf("заполнение achievement провалено: %w", err)
	}
	return nil
}

func (r *AchievementRepository) GetAllAchievements(ctx context.Context) ([]models.Achievement, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, code, title, description, sort_order
		FROM achievement
		ORDER BY sort_order, id
	`)
	if err != nil {
		return nil, fmt.Errorf("получение достижений провалено: %w", err)
	}
	defer rows.Close()

	var achievements []models.Achievement
	for rows.Next() {
		var a models.Achievement
		if err := rows.Scan(&a.ID, &a.Code, &a.Title, &a.Description, &a.SortOrder); err != nil {
			return nil, err
		}
		achievements = append(achievements, a)
	}

	return achievements, rows.Err()
}

func (r *AchievementRepository) GetUserUnlockedMap(ctx context.Context, userID int) (map[int]time.Time, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT achievement_id, unlocked_at
		FROM user_achievement
		WHERE user_id = $1
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("получение достижений пользователя провалено: %w", err)
	}
	defer rows.Close()

	unlocked := make(map[int]time.Time)
	for rows.Next() {
		var achievementID int
		var unlockedAt time.Time
		if err := rows.Scan(&achievementID, &unlockedAt); err != nil {
			return nil, err
		}
		unlocked[achievementID] = unlockedAt
	}

	return unlocked, rows.Err()
}

func (r *AchievementRepository) IsAchievementUnlocked(ctx context.Context, userID int, code string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx, `
		SELECT EXISTS (
			SELECT 1
			FROM user_achievement ua
			JOIN achievement a ON a.id = ua.achievement_id
			WHERE ua.user_id = $1 AND a.code = $2
		)
	`, userID, code).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("проверка достижения провалена: %w", err)
	}
	return exists, nil
}

func (r *AchievementRepository) UnlockAchievement(ctx context.Context, userID, achievementID int) (time.Time, error) {
	var unlockedAt time.Time
	err := r.pool.QueryRow(ctx, `
		INSERT INTO user_achievement (user_id, achievement_id)
		VALUES ($1, $2)
		ON CONFLICT (user_id, achievement_id) DO NOTHING
		RETURNING unlocked_at
	`, userID, achievementID).Scan(&unlockedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			err = r.pool.QueryRow(ctx, `
				SELECT unlocked_at
				FROM user_achievement
				WHERE user_id = $1 AND achievement_id = $2
			`, userID, achievementID).Scan(&unlockedAt)
			if err != nil {
				return time.Time{}, fmt.Errorf("получение даты разблокировки провалено: %w", err)
			}
			return unlockedAt, nil
		}
		return time.Time{}, fmt.Errorf("разблокировка достижения провалена: %w", err)
	}
	return unlockedAt, nil
}

func (r *AchievementRepository) CountCompletedWorkouts(ctx context.Context, userID int) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM workout_history
		WHERE user_id = $1 AND is_completed = true
	`, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("подсчёт завершённых тренировок провален: %w", err)
	}
	return count, nil
}

func (r *AchievementRepository) CountPersonalPlans(ctx context.Context, userID int) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*)
		FROM training_plan
		WHERE user_id = $1
	`, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("подсчёт персональных планов провален: %w", err)
	}
	return count, nil
}

func (r *AchievementRepository) SumCompletedWorkoutCalories(ctx context.Context, userID int) (int, error) {
	var sum int
	err := r.pool.QueryRow(ctx, `
		SELECT COALESCE(SUM(total_calories), 0)
		FROM workout_history
		WHERE user_id = $1 AND is_completed = true
	`, userID).Scan(&sum)
	if err != nil {
		return 0, fmt.Errorf("подсчёт калорий провален: %w", err)
	}
	return sum, nil
}
