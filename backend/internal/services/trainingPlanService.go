package services

import (
	"FedFit/internal/database/repositories"
	"FedFit/internal/models"
	"context"
	"fmt"
	"log"
	"strconv"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TrainingPlanRepos struct {
	TrainingPlanRepository   *repositories.TrainingPlanRepository
	TrainingPlanWorkoutRepos *repositories.TrainingPlanWorkoutRepository
	WorkoutRepository        *repositories.WorkoutRepository
}

type TrainingPlanServices struct {
	WorkoutService *WorkoutService
}

type TrainingPlanService struct {
	repos               *TrainingPlanRepos
	services            *TrainingPlanServices
	pool                *pgxpool.Pool
	achievementService  *AchievementService
}

func NewTrainingPlanService(
	pool *pgxpool.Pool,
	services *TrainingPlanServices,
	repos *TrainingPlanRepos,
	achievementService *AchievementService,
) *TrainingPlanService {
	return &TrainingPlanService{pool: pool, services: services, repos: repos, achievementService: achievementService}
}

func (s *TrainingPlanService) CreateTrainingPlan(ctx context.Context, tp *models.TrainingPlan) ([]models.AchievementResponse, error) {
	tx, err := s.pool.Begin(ctx)

	defer tx.Rollback(ctx)

	if err != nil {
		return nil, fmt.Errorf("begin tx: %s", err.Error())
	}

	if err := s.ensureUniquePlanName(ctx, tx, tp); err != nil {
		log.Printf("Ошибка подготовки имени плана: %s", err.Error())
		return nil, fmt.Errorf("Ошибка создания плана тренировки")
	}

	planId, err := s.repos.TrainingPlanRepository.CreateTrainingPlan(ctx, tx, tp)

	if err != nil {
		log.Printf("Ошибка создания плана тренировки: %s", err.Error())
		return nil, fmt.Errorf("Ошибка создания плана тренировки")
	}

	tp.ID = planId

	for i, workout := range tp.Workouts {
		var workoutId int

		switch {
		case workout.ID > 0:
			workoutId = workout.ID
		default:
			if existingID, resolveErr := s.services.WorkoutService.resolveExistingWorkoutID(ctx, tx, &tp.Workouts[i]); resolveErr != nil {
				log.Printf("Ошибка поиска тренировки по value: %s", resolveErr.Error())
				return nil, fmt.Errorf("Ошибка создания тренировки при создании плана")
			} else if existingID > 0 {
				workoutId = existingID
				tp.Workouts[i].ID = existingID
			} else {
				workoutId, err = s.services.WorkoutService.CreateWorkout(ctx, &tp.Workouts[i], WithTx(tx))
				if err != nil {
					log.Printf("Ошибка создания тренировки при создании плана: %s", err.Error())
					return nil, fmt.Errorf("Ошибка создания тренировки при создании плана")
				}
				tp.Workouts[i].ID = workoutId
			}
		}

		planIdStr := strconv.Itoa(planId)
		workoutIdStr := strconv.Itoa(workoutId)

		if err := s.repos.TrainingPlanWorkoutRepos.CreateNewLinkTrainingPlanWorkout(ctx, tx, planIdStr, workoutIdStr); err != nil {
			log.Printf("Ошибка связывания плана и тренировки с id: %d. Подробнее: %s", workout.ID, err.Error())
			return nil, fmt.Errorf("Ошибка связывания плана и тренировки с id: %d", workout.ID)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit tx: %w", err)
	}

	if tp.UserID != nil {
		return s.achievementService.ProcessAchievements(ctx, *tp.UserID)
	}

	return []models.AchievementResponse{}, nil
}
