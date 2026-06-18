package services

import (
	"FedFit/internal/database/repositories"
	"FedFit/internal/models"
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
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

type CreateWorkoutTxFunc func(*CreateWorkoutTx)

type CreateWorkoutTx struct {
	tx pgx.Tx
}

func WithTx(tx pgx.Tx) CreateWorkoutTxFunc {
	return func(o *CreateWorkoutTx) {
		o.tx = tx
	}
}

func (s *WorkoutService) CreateWorkout(ctx context.Context, workout *models.Workout, opts ...CreateWorkoutTxFunc) (id int, err error) {
	opt := &CreateWorkoutTx{}
	var ownTx bool

	for _, o := range opts {
		o(opt)
	}

	if opt.tx == nil {
		tx, err := s.pool.Begin(ctx)

		if err != nil {
			return 0, fmt.Errorf("begin tx: %s", err.Error())
		}

		opt.tx = tx
		ownTx = true
	}

	if ownTx {
		defer func() {
			if err != nil {
				opt.tx.Rollback(ctx)
			}
		}()
	}

	if err := s.ensureUniqueWorkoutValue(ctx, opt.tx, workout); err != nil {
		log.Printf("Ошибка подготовки value тренировки: %s", err)
		return 0, fmt.Errorf("Ошибка создания тренировки")
	}

	workoutId, err := s.repos.WorkoutRepository.CreateWorkout(ctx, opt.tx, workout)

	if err != nil {
		log.Printf("Ошибка создания тренировки: %s", err)
		return 0, fmt.Errorf("Ошибка создания тренировки")
	}

	for _, exercise := range workout.Exercises {
		if err := s.repos.WorkoutExercisesRepository.AddLinkWorkoutWithExercise(
			ctx,
			opt.tx,
			workoutId,
			exercise.ID,
			exercise.Sets,
			exercise.Reps,
			exercise.Duration,
		); err != nil {
			log.Printf("Ошибка связывания тренировки и упражнения с id: %d. Подробнее: %s", exercise.ID, err.Error())
			return 0, fmt.Errorf("Ошибка связывания тренировки и упражнения с id: %d", exercise.ID)
		}
	}

	if ownTx {
		opt.tx.Commit(ctx)
	}

	return workoutId, nil
}

func (s *WorkoutService) AddWorkoutToTrainingPlan(ctx context.Context, tpId string, workoutId string) error {
	tx, err := s.pool.Begin(ctx)

	defer tx.Rollback(ctx)

	if err != nil {
		return fmt.Errorf("begin tx: %s", err.Error())
	}

	if err := s.repos.TrainingPlanWorkoutRepository.CreateNewLinkTrainingPlanWorkout(ctx, tx, tpId, workoutId); err != nil {
		log.Printf("Ошибка связывания плана тренировки и тренировки: %s", err)
		return fmt.Errorf("Ошибка связывания плана тренировки и тренировки")
	}

	tx.Commit(ctx)
	return nil
}

func (s *WorkoutService) GetWorkout(ctx context.Context, workoutId string) (*models.Workout, error) {
	workout, err := s.repos.WorkoutRepository.GetWorkout(ctx, workoutId)

	if err != nil {
		return nil, fmt.Errorf("Ошибка получения тренировки: %s", err.Error())
	}

	return workout, nil
}
