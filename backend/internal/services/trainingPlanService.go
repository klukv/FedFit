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
	repos    *TrainingPlanRepos
	services *TrainingPlanServices
	pool     *pgxpool.Pool
}

func NewTrainingPlanService(pool *pgxpool.Pool, services *TrainingPlanServices, repos *TrainingPlanRepos) *TrainingPlanService {
	return &TrainingPlanService{pool: pool, services: services, repos: repos}
}

func (s *TrainingPlanService) CreateTrainingPlan(ctx context.Context, tp *models.TrainingPlan) error {
	tx, err := s.pool.Begin(ctx)

	defer tx.Rollback(ctx)

	if err != nil {
		return fmt.Errorf("begin tx: %s", err.Error())
	}

	planId, err := s.repos.TrainingPlanRepository.CreateTrainingPlan(ctx, tx, tp)

	if err != nil {
		log.Printf("Ошибка создания плана тренировки: %s", err.Error())
		return fmt.Errorf("Ошибка создания плана тренировки")
	}

	for _, workout := range tp.Workouts {
		var workoutId int

		if workout.ID == 0 {
			workoutId, err = s.services.WorkoutService.CreateWorkout(ctx, &workout, WithTx(tx))
			if err != nil {
				log.Printf("Ошибка создания тренировки при создании плана: %s", err.Error())
				return fmt.Errorf("Ошибка создания тренировки при создании плана")
			}
		} else {
			workoutId = workout.ID
		}

		planIdStr := strconv.Itoa(planId)
		workoutIdStr := strconv.Itoa(workoutId)

		if err := s.repos.TrainingPlanWorkoutRepos.CreateNewLinkTrainingPlanWorkout(ctx, tx, planIdStr, workoutIdStr); err != nil {
			log.Printf("Ошибка связывания плана и тренировки с id: %d. Подробнее: %s", workout.ID, err.Error())
			return fmt.Errorf("Ошибка связывания плана и тренировки с id: %d", workout.ID)
		}
	}

	tx.Commit(ctx)
	return nil
}
