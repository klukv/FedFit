package services

import (
	"FedFit/internal/database/repositories"
	"FedFit/internal/models"
	"context"
	"fmt"
	"strconv"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkoutHistoryServiceRepos struct {
	WorkoutHistoryRepository          *repositories.WorkoutHistoryRepository
	WorkoutHistoryExercisesRepository *repositories.WorkoutHistoryExercisesRepository
}

type WorkoutHistoryService struct {
	pool  *pgxpool.Pool
	repos *WorkoutHistoryServiceRepos
}

func NewWorkoutHistoryService(pool *pgxpool.Pool, repos *WorkoutHistoryServiceRepos) *WorkoutHistoryService {
	return &WorkoutHistoryService{pool: pool, repos: repos}
}

func (s *WorkoutHistoryService) AddWorkoutToHistory(
	ctx context.Context,
	userId string,
	workoutId string,
	workoutHistory *models.WorkoutHistoryDTO,
) error {
	userIdConvert, errConvertUserId := strconv.Atoi(userId)
	workoutIdConvert, errConvertWorkoutId := strconv.Atoi(workoutId)

	if errConvertUserId != nil {
		return fmt.Errorf("id пользователя не корректен")
	}

	if errConvertWorkoutId != nil {
		return fmt.Errorf("id тренировки не корректен")
	}

	tx, err := s.pool.Begin(ctx)

	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}

	defer tx.Rollback(ctx)

	workoutHistoryId, addingWorkoutHistoryErr := s.repos.WorkoutHistoryRepository.AddWorkoutToHistory(
		ctx,
		tx,
		workoutIdConvert,
		userIdConvert,
		workoutHistory.WorkoutForHistory,
	)

	if addingWorkoutHistoryErr != nil {
		return fmt.Errorf("%w", addingWorkoutHistoryErr)
	}

	if err := s.repos.WorkoutHistoryExercisesRepository.AddWorkoutHistoryExercises(
		ctx,
		tx,
		workoutHistoryId,
		workoutHistory.Exercises,
	); err != nil {
		return fmt.Errorf("%w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("Ошибка коммита. Подробнее: %w", err)
	}

	return nil
}

func (s *WorkoutHistoryService) GetHistoryByUserId(ctx context.Context, userId string) ([]models.WorkoutHistoryDTO, error) {
	userIdConv, err := strconv.Atoi(userId)

	if err != nil {
		return nil, fmt.Errorf("Передан некорректный id")
	}

	tx, err := s.pool.Begin(ctx)

	defer tx.Rollback(ctx)

	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}

	var workoutHistoryDTO []models.WorkoutHistoryDTO

	workoutsHistory, err := s.repos.WorkoutHistoryRepository.GetHistoryByUserId(ctx, tx, userIdConv)

	if err != nil {
		return nil, err
	}

	for _, history := range workoutsHistory {
		exercisesHistory, err := s.repos.WorkoutHistoryExercisesRepository.GetExercisesWorkoutHistoryByUserId(ctx, tx, history.Id)

		if err != nil {
			return nil, err
		}

		workoutHistoryDTO = append(workoutHistoryDTO, models.WorkoutHistoryDTO{
			WorkoutForHistory: history,
			Exercises:         exercisesHistory,
		})
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("Ошибка коммита. Подробнее: %w", err)
	}

	return workoutHistoryDTO, nil
}
