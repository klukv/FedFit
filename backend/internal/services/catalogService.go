package services

import (
	"FedFit/internal/database/repositories"
	"FedFit/internal/models"
	"context"
	"fmt"
)

type CatalogServiceRepos struct {
	Exercise     *repositories.ExerciseRepository
	Workout      *repositories.WorkoutRepository
	TrainingPlan *repositories.TrainingPlanRepository
}

type CatalogService struct {
	repos *CatalogServiceRepos
}

func NewCatalogService(repos *CatalogServiceRepos) *CatalogService {
	return &CatalogService{repos: repos}
}

func (s *CatalogService) ExportCatalog(ctx context.Context) (*models.CatalogExport, error) {
	exercises, err := s.repos.Exercise.GetForCatalog(ctx)
	if err != nil {
		return nil, fmt.Errorf("получение упражнений: %w", err)
	}

	workouts, err := s.repos.Workout.GetAllWithExercises(ctx)
	if err != nil {
		return nil, fmt.Errorf("получение тренировок: %w", err)
	}

	plans, err := s.repos.TrainingPlan.GetCatalogTrainingPlans(ctx)
	if err != nil {
		return nil, fmt.Errorf("получение планов: %w", err)
	}

	links, err := s.repos.TrainingPlan.GetPlanWorkoutLinks(ctx)
	if err != nil {
		return nil, fmt.Errorf("получение связей план-тренировка: %w", err)
	}

	return &models.CatalogExport{
		Exercises:                exercises,
		Workouts:                 workouts,
		TrainingPlans:            plans,
		TrainingPlanWorkoutLinks: links,
	}, nil
}
