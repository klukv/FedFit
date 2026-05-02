package services

import (
	"FedFit/internal/clients"
	"FedFit/internal/database/repositories"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Services struct {
	WorkoutHistoryService WorkoutHistoryService
	RecommendationService RecommendationService
}

func InitServices(pool *pgxpool.Pool, repos *repositories.Repositories, clients *clients.Clients) *Services {
	workoutHistoryService := NewWorkoutHistoryService(
		pool,
		&WorkoutHistoryServiceRepos{
			WorkoutHistoryRepository:          repos.WorkoutHistory,
			WorkoutHistoryExercisesRepository: repos.WorkoutHistoryExercises,
		})

	recommendationService := NewRecommendationService(pool, clients.RecommendationClient, &RecommendationRepositories{
		workoutRepos:   repos.Workout,
		exercisesRepos: repos.Exercise,
	})

	return &Services{
		WorkoutHistoryService: *workoutHistoryService,
		RecommendationService: *recommendationService,
	}
}
