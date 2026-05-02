package services

import (
	"FedFit/internal/clients"
	"FedFit/internal/database/repositories"

	"github.com/jackc/pgx/v5/pgxpool"
)

type RecommendationRepositories struct {
	workoutRepos   *repositories.WorkoutRepository
	exercisesRepos *repositories.ExerciseRepository
}

type RecommendationService struct {
	pool         *pgxpool.Pool
	repos        *RecommendationRepositories
	recommClient *clients.RecommendationClient
}

func NewRecommendationService(pool *pgxpool.Pool, client *clients.RecommendationClient, repos *RecommendationRepositories) *RecommendationService {
	return &RecommendationService{pool: pool, recommClient: client, repos: repos}
}
