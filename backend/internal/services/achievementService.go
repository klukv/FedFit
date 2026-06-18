package services

import (
	"FedFit/internal/database/repositories"
	"FedFit/internal/models"
	"context"
	"fmt"
	"strconv"
	"time"
)

type AchievementServiceRepos struct {
	Achievement *repositories.AchievementRepository
}

type AchievementService struct {
	repos *AchievementServiceRepos
}

func NewAchievementService(repos *AchievementServiceRepos) *AchievementService {
	return &AchievementService{repos: repos}
}

func (s *AchievementService) GetUserAchievements(ctx context.Context, userID int) ([]models.AchievementResponse, error) {
	if _, err := s.ProcessAchievements(ctx, userID); err != nil {
		return nil, err
	}

	achievements, err := s.repos.Achievement.GetAllAchievements(ctx)
	if err != nil {
		return nil, err
	}

	unlockedMap, err := s.repos.Achievement.GetUserUnlockedMap(ctx, userID)
	if err != nil {
		return nil, err
	}

	result := make([]models.AchievementResponse, 0, len(achievements))
	for _, achievement := range achievements {
		unlockedAt, unlocked := unlockedMap[achievement.ID]
		var unlockedAtPtr *time.Time
		if unlocked {
			unlockedAtPtr = &unlockedAt
		}

		response, err := s.buildAchievementResponse(ctx, achievement, unlocked, unlockedAtPtr, userID)
		if err != nil {
			return nil, err
		}
		result = append(result, response)
	}

	return result, nil
}

func (s *AchievementService) ProcessAchievements(ctx context.Context, userID int) ([]models.AchievementResponse, error) {
	achievements, err := s.repos.Achievement.GetAllAchievements(ctx)
	if err != nil {
		return nil, err
	}

	var newlyUnlocked []models.AchievementResponse

	for _, achievement := range achievements {
		alreadyUnlocked, err := s.repos.Achievement.IsAchievementUnlocked(ctx, userID, achievement.Code)
		if err != nil {
			return nil, err
		}
		if alreadyUnlocked {
			continue
		}

		shouldUnlock, err := s.shouldUnlock(ctx, userID, achievement.Code)
		if err != nil {
			return nil, err
		}
		if !shouldUnlock {
			continue
		}

		unlockedAt, err := s.repos.Achievement.UnlockAchievement(ctx, userID, achievement.ID)
		if err != nil {
			return nil, err
		}

		response, err := s.buildAchievementResponse(ctx, achievement, true, &unlockedAt, userID)
		if err != nil {
			return nil, err
		}
		newlyUnlocked = append(newlyUnlocked, response)
	}

	if newlyUnlocked == nil {
		newlyUnlocked = []models.AchievementResponse{}
	}

	return newlyUnlocked, nil
}

func (s *AchievementService) shouldUnlock(ctx context.Context, userID int, code string) (bool, error) {
	switch code {
	case models.AchievementCodeFirstWorkout:
		count, err := s.repos.Achievement.CountCompletedWorkouts(ctx, userID)
		if err != nil {
			return false, err
		}
		return count >= 1, nil
	case models.AchievementCodeFirstPlan:
		count, err := s.repos.Achievement.CountPersonalPlans(ctx, userID)
		if err != nil {
			return false, err
		}
		return count >= 1, nil
	case models.AchievementCodeFirstCalories:
		sum, err := s.repos.Achievement.SumCompletedWorkoutCalories(ctx, userID)
		if err != nil {
			return false, err
		}
		return sum > 0, nil
	default:
		return false, fmt.Errorf("неизвестный код достижения: %s", code)
	}
}

func (s *AchievementService) buildAchievementResponse(
	ctx context.Context,
	achievement models.Achievement,
	unlocked bool,
	unlockedAt *time.Time,
	userID int,
) (models.AchievementResponse, error) {
	value := "0"
	text := achievementText(achievement.Code)

	if unlocked {
		var err error
		value, err = s.achievementValue(ctx, userID, achievement.Code)
		if err != nil {
			return models.AchievementResponse{}, err
		}
	}

	return models.AchievementResponse{
		ID:          achievement.ID,
		Code:        achievement.Code,
		Title:       achievement.Title,
		Description: achievement.Description,
		Value:       value,
		Text:        text,
		Unlocked:    unlocked,
		UnlockedAt:  unlockedAt,
	}, nil
}

func (s *AchievementService) achievementValue(ctx context.Context, userID int, code string) (string, error) {
	switch code {
	case models.AchievementCodeFirstWorkout:
		count, err := s.repos.Achievement.CountCompletedWorkouts(ctx, userID)
		if err != nil {
			return "", err
		}
		return strconv.Itoa(count), nil
	case models.AchievementCodeFirstPlan:
		count, err := s.repos.Achievement.CountPersonalPlans(ctx, userID)
		if err != nil {
			return "", err
		}
		return strconv.Itoa(count), nil
	case models.AchievementCodeFirstCalories:
		sum, err := s.repos.Achievement.SumCompletedWorkoutCalories(ctx, userID)
		if err != nil {
			return "", err
		}
		return strconv.Itoa(sum), nil
	default:
		return "0", nil
	}
}

func achievementText(code string) string {
	switch code {
	case models.AchievementCodeFirstWorkout:
		return "тренировок"
	case models.AchievementCodeFirstPlan:
		return "планов"
	case models.AchievementCodeFirstCalories:
		return "калории"
	default:
		return ""
	}
}
