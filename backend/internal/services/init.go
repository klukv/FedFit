package services

import (
	"FedFit/internal/clients"
	"FedFit/internal/database/repositories"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Services struct {
	WorkoutHistoryService *WorkoutHistoryService
	RecommendationService *RecommendationService
	WorkoutService        *WorkoutService
	TrainingService       *TrainingPlanService
}

func InitServices(pool *pgxpool.Pool, repos *repositories.Repositories, clients *clients.Clients) *Services {
	workoutHistoryService := NewWorkoutHistoryService(
		pool,
		&WorkoutHistoryServiceRepos{
			WorkoutHistoryRepository:          repos.WorkoutHistory,
			WorkoutHistoryExercisesRepository: repos.WorkoutHistoryExercises,
		})

	recommendationService := NewRecommendationService(pool, clients.RecommendationClient, &RecommendationServiceRepositories{
		workoutRepos:   repos.Workout,
		exercisesRepos: repos.Exercise,
	})

	workoutService := NewWorkoutService(
		pool,
		&WorkoutServiceRepos{
			WorkoutRepository:          repos.Workout,
			WorkoutExercisesRepository: repos.WorkoutExercise,
		},
	)

	trainingPlan := NewTrainingPlanService(
		pool,
		&TrainingPlanServices{
			WorkoutService: workoutService,
		},
		&TrainingPlanRepos{
			TrainingPlanRepository:   repos.TrainingPlan,
			TrainingPlanWorkoutRepos: repos.TpWorkout,
			WorkoutRepository:        repos.Workout,
		},
	)

	return &Services{
		WorkoutHistoryService: workoutHistoryService,
		RecommendationService: recommendationService,
		WorkoutService:        workoutService,
		TrainingService:       trainingPlan,
	}
}
