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
	pool               *pgxpool.Pool
	repos              *WorkoutHistoryServiceRepos
	achievementService *AchievementService
}

func NewWorkoutHistoryService(
	pool *pgxpool.Pool,
	repos *WorkoutHistoryServiceRepos,
	achievementService *AchievementService,
) *WorkoutHistoryService {
	return &WorkoutHistoryService{pool: pool, repos: repos, achievementService: achievementService}
}

func (s *WorkoutHistoryService) AddWorkoutToHistory(
	ctx context.Context,
	userId string,
	workoutId string,
	workoutHistory *models.WorkoutHistoryDTO,
) ([]models.AchievementResponse, error) {
	userIdConvert, errConvertUserId := strconv.Atoi(userId)
	workoutIdConvert, errConvertWorkoutId := strconv.Atoi(workoutId)

	if errConvertUserId != nil {
		return nil, fmt.Errorf("id пользователя не корректен")
	}

	if errConvertWorkoutId != nil {
		return nil, fmt.Errorf("id тренировки не корректен")
	}

	tx, err := s.pool.Begin(ctx)

	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
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
		return nil, fmt.Errorf("%w", addingWorkoutHistoryErr)
	}

	if err := s.repos.WorkoutHistoryExercisesRepository.AddWorkoutHistoryExercises(
		ctx,
		tx,
		workoutHistoryId,
		workoutHistory.Exercises,
	); err != nil {
		return nil, fmt.Errorf("%w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("Ошибка коммита. Подробнее: %w", err)
	}

	if workoutHistory.WorkoutForHistory.Is_completed {
		return s.achievementService.ProcessAchievements(ctx, userIdConvert)
	}

	return []models.AchievementResponse{}, nil
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

func (s *WorkoutHistoryService) UpdateWorkoutHistory(
	ctx context.Context,
	workoutHistoryId string,
	workoutHistory *models.WorkoutHistoryDTO,
) ([]models.AchievementResponse, error) {
	workoutHistoryIdConvert, err := strconv.Atoi(workoutHistoryId)

	if err != nil {
		return nil, fmt.Errorf("id тренировки из истории не корректен")
	}

	userID, err := s.repos.WorkoutHistoryRepository.GetUserIDByHistoryID(ctx, workoutHistoryIdConvert)
	if err != nil {
		return nil, err
	}

	tx, err := s.pool.Begin(ctx)

	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}

	if err := s.repos.WorkoutHistoryRepository.UpdateWorkoutHistory(ctx, tx, workoutHistoryIdConvert, workoutHistory.WorkoutForHistory); err != nil {
		return nil, err
	}

	if err := s.repos.WorkoutHistoryExercisesRepository.UpdateWorkoutHistoryExercises(ctx, tx, workoutHistoryIdConvert, workoutHistory.Exercises); err != nil {
		return nil, err
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("Ошибка коммита. Подробнее: %w", err)
	}

	if workoutHistory.WorkoutForHistory.Is_completed {
		return s.achievementService.ProcessAchievements(ctx, userID)
	}

	return []models.AchievementResponse{}, nil
}
