package services

import (
	"FedFit/internal/clients"
	"FedFit/internal/models"
	"context"
	"encoding/json"
	"fmt"
	"log"
)

type RecommendationService struct {
	recommClient *clients.RecommendationClient
	trainingSvc  *TrainingPlanService
}

func NewRecommendationService(
	client *clients.RecommendationClient,
	trainingSvc *TrainingPlanService,
) *RecommendationService {
	return &RecommendationService{
		recommClient: client,
		trainingSvc:  trainingSvc,
	}
}

func (s *RecommendationService) GetRecommendationForUser(ctx context.Context, surveyResult models.SurveyResult) (*models.TrainingPlan, error) {
	res, err := s.recommClient.GetRecommendationPlan(ctx, surveyResult)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	var trainingPlan models.TrainingPlan
	if err := json.NewDecoder(res.Body).Decode(&trainingPlan); err != nil {
		log.Printf("Ошибка десериализации данных из тела ответа рекомендательного сервиса: %s", err)
		return nil, fmt.Errorf("ошибка десериализации данных из тела ответа рекомендательного сервиса")
	}

	if surveyResult.Persist {
		goal := string(surveyResult.Goal)
		level := string(surveyResult.Level)
		trainingPlan.Goal = &goal
		trainingPlan.TargetLevel = &level
		trainingPlan.UserID = surveyResult.UserID

		if _, err := s.trainingSvc.CreateTrainingPlan(ctx, &trainingPlan); err != nil {
			return nil, fmt.Errorf("сохранение рекомендованного плана: %w", err)
		}
	}

	return &trainingPlan, nil
}
