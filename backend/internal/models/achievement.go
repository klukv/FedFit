package models

import "time"

const (
	AchievementCodeFirstWorkout  = "first_workout"
	AchievementCodeFirstPlan     = "first_plan"
	AchievementCodeFirstCalories = "first_calories"
)

type Achievement struct {
	ID          int    `json:"id"`
	Code        string `json:"code"`
	Title       string `json:"title"`
	Description string `json:"description"`
	SortOrder   int    `json:"sortOrder"`
}

type AchievementResponse struct {
	ID          int        `json:"id"`
	Code        string     `json:"code"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Value       string     `json:"value"`
	Text        string     `json:"text"`
	Unlocked    bool       `json:"unlocked"`
	UnlockedAt  *time.Time `json:"unlockedAt,omitempty"`
}

type WorkoutHistoryMutationResponse struct {
	NewAchievements []AchievementResponse `json:"newAchievements"`
}
