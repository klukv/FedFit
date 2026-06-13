package models

import "encoding/json"

// CatalogExport — snapshot каталога для recomm_system (GET /v1/internal/catalog/export).
type CatalogExport struct {
	Exercises                []Exercise                `json:"exercises"`
	Workouts                 []CatalogWorkout          `json:"workouts"`
	TrainingPlans            []CatalogTrainingPlan     `json:"training_plans"`
	TrainingPlanWorkoutLinks []TrainingPlanWorkoutLink `json:"training_plan_workout_links"`
}

// CatalogWorkout — тренировка в формате каталога (snake_case, без timestamps).
type CatalogWorkout struct {
	ID           int                    `json:"id"`
	Name         string                 `json:"name"`
	Value        string                 `json:"value"`
	Description  *string                `json:"description"`
	Image        *string                `json:"image"`
	Level        string                 `json:"level"`
	CaloriesMin  int                    `json:"calories_min"`
	CaloriesMax  int                    `json:"calories_max"`
	Duration     int                    `json:"duration"`
	MuscleGroups json.RawMessage        `json:"muscle_groups"`
	Exercises    []WorkoutExerciseLink  `json:"exercises"`
}

// WorkoutExerciseLink — связь тренировка ↔ упражнение (только id и параметры серии).
type WorkoutExerciseLink struct {
	ExerciseID int  `json:"exercise_id"`
	Sets       *int `json:"sets"`
	Reps       *int `json:"reps"`
	Duration   *int `json:"duration"`
}

// CatalogTrainingPlan — план в формате каталога (snake_case target_level).
type CatalogTrainingPlan struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Goal        *string `json:"goal"`
	TargetLevel *string `json:"target_level"`
}

// TrainingPlanWorkoutLink — связь план ↔ тренировка.
type TrainingPlanWorkoutLink struct {
	TrainingPlanID int `json:"training_plan_id"`
	WorkoutID      int `json:"workout_id"`
}
