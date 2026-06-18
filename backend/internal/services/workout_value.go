package services

import (
	"FedFit/internal/models"
	"FedFit/internal/utils"
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
)

func (s *WorkoutService) resolveExistingWorkoutID(
	ctx context.Context,
	tx pgx.Tx,
	workout *models.Workout,
) (int, error) {
	if !utils.IsWorkoutCatalogSlug(workout.Value) {
		return 0, nil
	}

	return s.repos.WorkoutRepository.GetWorkoutIDByValue(ctx, tx, workout.Value)
}

func (s *WorkoutService) ensureUniqueWorkoutValue(
	ctx context.Context,
	tx pgx.Tx,
	workout *models.Workout,
) error {
	if utils.IsWorkoutCatalogSlug(workout.Value) {
		exists, err := s.repos.WorkoutRepository.WorkoutValueExists(ctx, tx, workout.Value)
		if err != nil {
			return fmt.Errorf("проверка value тренировки: %w", err)
		}
		if !exists {
			return nil
		}
	}

	base := utils.SlugifyWorkoutName(workout.Name)
	if base == "" {
		base = "generated-workout"
	}

	candidate := base
	for i := 0; ; i++ {
		if i > 0 {
			candidate = fmt.Sprintf("%s-%d", base, i)
		}

		exists, err := s.repos.WorkoutRepository.WorkoutValueExists(ctx, tx, candidate)
		if err != nil {
			return fmt.Errorf("проверка уникальности value: %w", err)
		}
		if !exists {
			workout.Value = candidate
			return nil
		}
	}
}
