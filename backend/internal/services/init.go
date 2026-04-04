package services

import (
	"FedFit/internal/database/repositories"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Services struct {
	WorkoutHistoryService WorkoutHistoryService
}

func InitServices(pool *pgxpool.Pool, repos *repositories.Repositories) *Services {
	workoutHistoryService := NewWorkoutHistoryService(
		pool,
		&WorkoutHistoryServiceRepos{
			WorkoutHistoryRepository:          repos.WorkoutHistory,
			WorkoutHistoryExercisesRepository: repos.WorkoutHistoryExercises,
		})

	return &Services{
		WorkoutHistoryService: *workoutHistoryService,
	}
}
