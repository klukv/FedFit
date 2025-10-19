package repositories

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repositories struct {
	TrainingPlan *TrainingPlanRepository
	Workout      *WorkoutRepository
	TpWorkout    *TrainingPlanWorkoutRepository
}

func InitRepositories(pool *pgxpool.Pool, ctx context.Context) (*Repositories, error) {
	trainingPlanRepository := NewTrainingPlanRepository(pool)
	workoutRepository := NewWorkoutRepository(pool)
	tpWorkoutRepository := NewTrainingPlanWorkoutsRepository(pool)

	if err := trainingPlanRepository.CreateTrainingPlanTable(ctx); err != nil {
		return nil, err
	}

	if err := workoutRepository.CreateWorkoutTable(ctx); err != nil {
		return nil, err
	}

	if err := tpWorkoutRepository.CreateTrainingPlanWorkoutTable(ctx); err != nil {
		return nil, err
	}

	return &Repositories{
		TrainingPlan: trainingPlanRepository,
		Workout:      workoutRepository,
		TpWorkout:    tpWorkoutRepository,
	}, nil
}
