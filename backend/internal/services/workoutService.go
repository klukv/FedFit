package services

import (
	"FedFit/internal/database/repositories"
	"FedFit/internal/models"
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

type WorkoutServiceRepos struct {
	WorkoutRepository             *repositories.WorkoutRepository
	WorkoutExercisesRepository    *repositories.WorkoutExerciseRepository
	TrainingPlanWorkoutRepository *repositories.TrainingPlanWorkoutRepository
}

type WorkoutService struct {
	pool  *pgxpool.Pool
	repos *WorkoutServiceRepos
}

func NewWorkoutService(pool *pgxpool.Pool, repos *WorkoutServiceRepos) *WorkoutService {
	return &WorkoutService{pool: pool, repos: repos}
}

func (s *WorkoutService) GetWorkouts(ctx context.Context) ([]models.Workout, error) {
	workouts, err := s.repos.WorkoutRepository.GetAllWorkouts(ctx)

	if err != nil {
		log.Printf("Ошибка получения списка тренировок: %s", err)
		return nil, fmt.Errorf("Ошибка получения списка тренировок")
	}

	return workouts, nil
}

func (s *WorkoutService) CreateWorkout(ctx context.Context, workout *models.Workout) error {
	tx, err := s.pool.Begin(ctx)

	defer tx.Rollback(ctx)

	if err != nil {
		return fmt.Errorf("begin tx: %s", err.Error())
	}

	workoutId, err := s.repos.WorkoutRepository.CreateWorkout(ctx, tx, workout)

	if err != nil {
		log.Printf("Ошибка создания тренировки: %s", err)
		return fmt.Errorf("Ошибка создания тренировки")
	}

	for _, exercise := range workout.Exercises {
		if err := s.repos.WorkoutExercisesRepository.AddLinkWorkoutWithExercise(
			ctx,
			tx,
			workoutId,
			exercise.ID,
			*exercise.Sets,
			*exercise.Reps,
			*exercise.Duration,
		); err != nil {
			log.Printf("Ошибка связывания тренировки и упражнения с id: %d. Подробнее: %s", exercise.ID, err.Error())
			return fmt.Errorf("Ошибка связывания тренировки и упражнения с id: %d", exercise.ID)
		}
	}

	tx.Commit(ctx)

	return nil
}

func (s *WorkoutService) AddWorkoutToTrainingPlan(ctx context.Context, tpId string, workoutId string) error {
	if err := s.repos.TrainingPlanWorkoutRepository.CreateNewLinkTrainingPlanWorkout(ctx, tpId, workoutId); err != nil {
		log.Printf("Ошибка связывания плана тренировки и тренировки: %s", err)
		return fmt.Errorf("Ошибка связывания плана тренировки и тренировки")
	}
	return nil
}

func (s *WorkoutService) GetWorkout(ctx context.Context, workoutId string) (*models.Workout, error) {
	workout, err := s.repos.WorkoutRepository.GetWorkout(ctx, workoutId)

	if err != nil {
		return nil, fmt.Errorf("Ошибка получения тренировки: %s", err.Error())
	}

	return workout, nil
}
