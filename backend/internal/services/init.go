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
	CatalogService        *CatalogService
	ExerciseService       *ExerciseService
}

func InitServices(pool *pgxpool.Pool, repos *repositories.Repositories, clients *clients.Clients) *Services {
	workoutHistoryService := NewWorkoutHistoryService(
		pool,
		&WorkoutHistoryServiceRepos{
			WorkoutHistoryRepository:          repos.WorkoutHistory,
			WorkoutHistoryExercisesRepository: repos.WorkoutHistoryExercises,
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

	recommendationService := NewRecommendationService(clients.RecommendationClient, trainingPlan)

	catalogService := NewCatalogService(&CatalogServiceRepos{
		Exercise:     repos.Exercise,
		Workout:      repos.Workout,
		TrainingPlan: repos.TrainingPlan,
	})

	exerciseService := NewExerciseService(repos.Exercise)

	return &Services{
		WorkoutHistoryService: workoutHistoryService,
		RecommendationService: recommendationService,
		WorkoutService:        workoutService,
		TrainingService:       trainingPlan,
		CatalogService:        catalogService,
		ExerciseService:       exerciseService,
	}
}
