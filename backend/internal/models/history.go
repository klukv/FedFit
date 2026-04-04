package models

import (
	"FedFit/internal/utils"
)

type WorkoutHistoryDTO struct {
	WorkoutForHistory WorkoutHistory   `json:"workout_for_history"`
	Exercises         []WHExercisesDTO `json:"exercises"`
}

type WorkoutHistory struct {
	Started_at     utils.CustomDate `json:"started_at"`
	Finished_at    utils.CustomDate `json:"finished_at"`
	Total_calories int              `json:"total_calories"`
	Total_duration int              `json:"total_duration"`
	Is_completed   bool             `json:"is_completed"`
}

type WHExercisesDTO struct {
	Id             int  `json:"id"`
	SetsDone       int  `json:"sets_done"`
	RepsDone       int  `json:"reps_done"`
	DurationDone   int  `json:"duration_done"`
	CaloriesBurned int  `json:"calories_burned"`
	IsCompleted    bool `json:"is_completed"`
}
