package services

import (
	"FedFit/internal/clients"
	"FedFit/internal/database/repositories"
	"FedFit/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"log"

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

func (s *RecommendationService) GetRecommendationForUser(ctx context.Context, surveyResult models.SurveyResult) (*models.TrainingPlan, error) {
	res, err := s.recommClient.GetRecommendationPlan(ctx, surveyResult)

	if err != nil {
		return nil, err
	}

	defer res.Body.Close()

	var TrainingPlan models.TrainingPlan

	err = json.NewDecoder(res.Body).Decode(&TrainingPlan)

	if err != nil {
		log.Printf("Ошибка десериализации данных из тела ответа рекомендательного сервиса: %s", err)
		return nil, fmt.Errorf("Ошибка десериализации данных из тела ответа рекомендательного сервиса")
	}

	return &TrainingPlan, nil
}
