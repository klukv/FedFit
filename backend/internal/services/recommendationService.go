package services

import (
	"FedFit/internal/clients"
	"FedFit/internal/database/repositories"

	"github.com/jackc/pgx/v5/pgxpool"
)

type RecommendationServiceRepositories struct {
	workoutRepos   *repositories.WorkoutRepository
	exercisesRepos *repositories.ExerciseRepository
}

type RecommendationService struct {
	pool         *pgxpool.Pool
	repos        *RecommendationServiceRepositories
	recommClient *clients.RecommendationClient
}

func NewRecommendationService(pool *pgxpool.Pool, client *clients.RecommendationClient, repos *RecommendationServiceRepositories) *RecommendationService {
	return &RecommendationService{pool: pool, recommClient: client, repos: repos}
}

func (s *RecommendationService) GetRecommendationForUser(userId string) {}
