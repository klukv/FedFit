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

type EquipmentType string
type Equipment []EquipmentType

const (
	NONE       EquipmentType = "none"
	DUMBBELLS  EquipmentType = "dumbbells"
	BARBELL    EquipmentType = "barbell"
	PULLUP_BAR EquipmentType = "pullup_bar"
	KETTLEBELL EquipmentType = "kettlebell"
)

type RestrictionsType string
type Restrictions []RestrictionsType

const (
	KNEE     RestrictionsType = "knee"
	BACK     RestrictionsType = "back"
	SHOULDER RestrictionsType = "shoulder"
)

type MuscleGroupType string
type MuscleGroup []MuscleGroupType

const (
	CHEST       MuscleGroupType = "chest"
	MUSCLE_BACK MuscleGroupType = "back"
	LEGS        MuscleGroupType = "legs"
	SHOULDERS   MuscleGroupType = "shoulders"
	ARMS        MuscleGroupType = "arms"
	CORE        MuscleGroupType = "core"
	CARDIO      MuscleGroupType = "cardio"
	GLUTES      MuscleGroupType = "glutes"
	FULL_BODY   MuscleGroupType = "full_body"
)

type SurveyResult struct {
	Goal               Goal         `json:"goal"`
	Level              Level        `json:"level"`
	Equipment          Equipment    `json:"equipment"`
	Restrictions       Restrictions `json:"restrictions"`
	MuscleGroup        MuscleGroup  `json:"muscleGroup"`
	Frequency          int          `json:"frequency"`
	DurationPreference int          `json:"duration_preference"`
}

type RecommendationPlan struct {
}
