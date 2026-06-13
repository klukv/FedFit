package models

import "time"

type TrainingPlan struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	UserID      *int      `json:"userId"`
	Workouts    []Workout `json:"workouts"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type TrainingPlans struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type CreateTrainingPlanResponse struct {
	ID      int    `json:"id"`
	Message string `json:"message"`
}
