package models

import (
	"FedFit/internal/utils"
	"time"
)

type WorkoutHistoryDTO struct {
	WorkoutForHistory WorkoutHistory   `json:"workoutForHistory"`
	Exercises         []WHExercisesDTO `json:"exercises"`
}

type WorkoutHistory struct {
	Id             int              `json:"id"`
	Started_at     utils.CustomDate `json:"startedAt"`
	Finished_at    utils.CustomDate `json:"finishedAt"`
	Total_calories int              `json:"totalCalories"`
	Total_duration int              `json:"totalDuration"`
	Is_completed   bool             `json:"isCompleted"`
	CreatedAt      time.Time        `json:"createdAt"`
	UpdatedAt      time.Time        `json:"updatedAt"`
}

type WHExercisesDTO struct {
	Id             int  `json:"id"`
	SetsDone       int  `json:"setsDone"`
	RepsDone       int  `json:"repsDone"`
	DurationDone   int  `json:"durationDone"`
	CaloriesBurned int  `json:"caloriesBurned"`
	IsCompleted    bool `json:"isCompleted"`
}
