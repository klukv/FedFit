package models

import "encoding/json"

// Exercise — единая модель упражнения.
// В ответах API метаданные опциональны (omitempty).
// Для экспорта каталога вызывается ApplyCatalogDefaults.
type Exercise struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Icon        *string `json:"icon,omitempty"`

	MuscleGroup          *string         `json:"muscle_group,omitempty"`
	Equipment            json.RawMessage `json:"equipment,omitempty"`
	RestrictionsExcluded json.RawMessage `json:"restrictions_excluded,omitempty"`
	Level                json.RawMessage `json:"level,omitempty"`
	CaloriesPerSet       *float64        `json:"calories_per_set,omitempty"`

	Sets     *int `json:"sets,omitempty"`
	Reps     *int `json:"reps,omitempty"`
	Duration *int `json:"duration,omitempty"`
}

// ExerciseMetadataInput — тело запроса PUT /v1/exercises/{id}/metadata.
type ExerciseMetadataInput struct {
	MuscleGroup          string          `json:"muscle_group"`
	Equipment            json.RawMessage `json:"equipment"`
	RestrictionsExcluded json.RawMessage `json:"restrictions_excluded"`
	Level                json.RawMessage `json:"level"`
	CaloriesPerSet       float64         `json:"calories_per_set"`
}

// ExercisePrescription — дефолтные sets/reps/duration для экспорта каталога.
type ExercisePrescription struct {
	Sets     *int
	Reps     *int
	Duration *int
}

func (e *Exercise) ApplyCatalogDefaults(prescription *ExercisePrescription) {
	if e.MuscleGroup == nil {
		empty := ""
		e.MuscleGroup = &empty
	}
	if len(e.Equipment) == 0 {
		e.Equipment = json.RawMessage(`["none"]`)
	}
	if len(e.RestrictionsExcluded) == 0 {
		e.RestrictionsExcluded = json.RawMessage(`[]`)
	}
	if len(e.Level) == 0 {
		e.Level = json.RawMessage(`["beginner"]`)
	}
	if e.CaloriesPerSet == nil {
		defaultCal := 10.0
		e.CaloriesPerSet = &defaultCal
	}
	if prescription != nil {
		e.Sets = prescription.Sets
		e.Reps = prescription.Reps
		e.Duration = prescription.Duration
	}
}
