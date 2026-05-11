package models

// Типы анкеты для запроса к микросервису рекомендаций (POST /recommend).
// Ответ POST /recommend: план с полями id, name, description, workouts, created_at, updated_at.
// Каждая тренировка в workouts по смыслу как WorkoutDetail: id, name, description, image,
// level, caloriesMin, caloriesMax, duration, exercisesCount, exercises[].
// Элемент exercises — как models.Exercise: id, name, description, icon, sets, reps, duration.

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
	Goal               Goal        `json:"goal"`
	Level              Level       `json:"level"`
	Equipment          Equipment   `json:"equipment"`
	Restriction        Restriction `json:"restriction"`
	MuscleGroup        MuscleGroup `json:"muscleGroup"`
	Frequency          int         `json:"frequency"`
	DurationPreference int         `json:"duration_preference"`
}
