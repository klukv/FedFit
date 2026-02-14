package models

import "time"

type Workout struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Value     string    `json:"value"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type WorkoutDetail struct {
	ID             int        `json:"id"`
	Name           string     `json:"name"`
	Description    *string    `json:"description,omitempty"`
	Image          *string    `json:"image,omitempty"`
	ExercisesCount int        `json:"exercisesCount"`
	Duration       int        `json:"duration"`
	Level          string     `json:"level"`
	CaloriesMin    int        `json:"caloriesMin"`
	CaloriesMax    int        `json:"caloriesMax"`
	Exercises      []Exercise `json:"exercises"`
}

type Exercise struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Icon        *string `json:"icon,omitempty"`
	Sets        *int    `json:"sets,omitempty"`
	Reps        *int    `json:"reps,omitempty"`
	Duration    *int    `json:"duration,omitempty"`
}
