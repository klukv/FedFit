package services

import (
	"FedFit/internal/models"
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
)

func (s *TrainingPlanService) ensureUniquePlanName(
	ctx context.Context,
	tx pgx.Tx,
	tp *models.TrainingPlan,
) error {
	base := strings.TrimSpace(tp.Name)
	if base == "" {
		base = "План тренировок"
	}

	for i := 0; ; i++ {
		candidate := base
		if i > 0 {
			candidate = fmt.Sprintf("%s (%d)", base, i+1)
		}

		exists, err := s.repos.TrainingPlanRepository.PlanNameExists(ctx, tx, candidate, tp.UserID)
		if err != nil {
			return fmt.Errorf("проверка уникальности имени плана: %w", err)
		}
		if !exists {
			tp.Name = candidate
			return nil
		}
	}
}
