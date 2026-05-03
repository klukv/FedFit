package models

type Goal string

const (
	WEIGHT_LOSS     Goal = "weight_loss"
	MUSCLE_GAIN     Goal = "muscle_gain"
	ENDURANCE       Goal = "endurance"
	GENERAL_FITNESS Goal = "general_fitness"
)

type Level string

const (
	BEGINNER     Level = "beginner"
	INTERMEDIATE Level = "intermediate"
	ADVANCED     Level = "advanced"
)

type Equipment string

const (
	NONE       Equipment = "none"
	DUMBBELLS  Equipment = "dumbbells"
	BARBELL    Equipment = "barbell"
	PULLUP_BAR Equipment = "pullup_bar"
	KETTLEBELL Equipment = "kettlebell"
)

type Restriction string

const (
	KNEE     Restriction = "knee"
	BACK     Restriction = "back"
	SHOULDER Restriction = "shoulder"
)

type MuscleGroup string

const (
	CHEST       MuscleGroup = "chest"
	MUSCLE_BACK MuscleGroup = "back"
	LEGS        MuscleGroup = "legs"
	SHOULDERS   MuscleGroup = "shoulders"
	ARMS        MuscleGroup = "arms"
	CORE        MuscleGroup = "core"
	CARDIO      MuscleGroup = "cardio"
	GLUTES      MuscleGroup = "glutes"
	FULL_BODY   MuscleGroup = "full_body"
)

type SurveyResult struct {
	Goal        Goal        `json:"goal"`
	Level       Level       `json:"level"`
	Equipment   Equipment   `json:"equipment"`
	Restriction Restriction `json:"restriction"`
	MuscleGroup MuscleGroup `json:"muscleGroup"`
}
