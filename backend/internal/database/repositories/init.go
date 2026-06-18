package repositories

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repositories struct {
	TrainingPlan            *TrainingPlanRepository
	Workout                 *WorkoutRepository
	TpWorkout               *TrainingPlanWorkoutRepository
	Exercise                *ExerciseRepository
	WorkoutExercise         *WorkoutExerciseRepository
	WorkoutHistory          *WorkoutHistoryRepository
	WorkoutHistoryExercises *WorkoutHistoryExercisesRepository
	Users                   *UsersRepositry
	Achievement             *AchievementRepository
}

func InitRepositories(pool *pgxpool.Pool, ctx context.Context) (*Repositories, error) {
	trainingPlanRepository := NewTrainingPlanRepository(pool)
	workoutRepository := NewWorkoutRepository(pool)
	tpWorkoutRepository := NewTrainingPlanWorkoutsRepository(pool)
	exersiceRepository := NewExerciseRepository(pool)
	workoutExersiceRepository := NewWorkoutExerciseRepository(pool)
	workoutHistoryRepository := NewWorkoutHistoryRepository(pool)
	workoutHistoryExersiceRepository := NewWorkoutHistoryExercisesRepository(pool)
	usersRepository := NewUsersRepositry(pool)
	achievementRepository := NewAchievementRepository(pool)

	if err := usersRepository.CreateUsersTable(ctx); err != nil {
		return nil, err
	}

	if err := exersiceRepository.CreateExerciseTable(ctx); err != nil {
		return nil, err
	}

	if err := workoutRepository.CreateWorkoutTable(ctx); err != nil {
		return nil, err
	}

	if err := workoutExersiceRepository.CreateWorkoutExerciseTable(ctx); err != nil {
		return nil, err
	}

	if err := trainingPlanRepository.CreateTrainingPlanTable(ctx); err != nil {
		return nil, err
	}

	if err := tpWorkoutRepository.CreateTrainingPlanWorkoutTable(ctx); err != nil {
		return nil, err
	}

	if err := workoutHistoryRepository.CreateWorkoutHistoryTable(ctx); err != nil {
		return nil, err
	}

	if err := workoutHistoryExersiceRepository.CreateWorkoutHistoryExercisesTable(ctx); err != nil {
		return nil, err
	}

	if err := achievementRepository.CreateAchievementTable(ctx); err != nil {
		return nil, err
	}

	if err := achievementRepository.CreateUserAchievementTable(ctx); err != nil {
		return nil, err
	}

	if err := achievementRepository.SeedAchievements(ctx); err != nil {
		return nil, err
	}

	return &Repositories{
		TrainingPlan:            trainingPlanRepository,
		Workout:                 workoutRepository,
		TpWorkout:               tpWorkoutRepository,
		Exercise:                exersiceRepository,
		WorkoutExercise:         workoutExersiceRepository,
		WorkoutHistory:          workoutHistoryRepository,
		WorkoutHistoryExercises: workoutHistoryExersiceRepository,
		Users:                   usersRepository,
		Achievement:             achievementRepository,
	}, nil
}
