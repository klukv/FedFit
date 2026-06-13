package services

import (
	"FedFit/internal/database/repositories"
	"FedFit/internal/models"
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
)

type ExerciseService struct {
	repos *repositories.ExerciseRepository
}

func NewExerciseService(repos *repositories.ExerciseRepository) *ExerciseService {
	return &ExerciseService{repos: repos}
}

func (s *ExerciseService) GetAll(ctx context.Context) ([]models.Exercise, error) {
	return s.repos.GetAll(ctx)
}

func (s *ExerciseService) GetByID(ctx context.Context, id int) (*models.Exercise, error) {
	return s.repos.GetByID(ctx, id)
}

func (s *ExerciseService) UpsertMetadata(ctx context.Context, exerciseID int, req *models.ExerciseMetadataInput) error {
	exercise, err := s.repos.GetByID(ctx, exerciseID)
	if err != nil {
		return fmt.Errorf("проверка упражнения: %w", err)
	}
	if exercise == nil {
		return pgx.ErrNoRows
	}

	return s.repos.UpsertMetadata(ctx, exerciseID, req)
}

func (s *ExerciseService) DeleteMetadata(ctx context.Context, exerciseID int) error {
	err := s.repos.DeleteMetadata(ctx, exerciseID)
	if errors.Is(err, pgx.ErrNoRows) {
		return pgx.ErrNoRows
	}
	return err
}
