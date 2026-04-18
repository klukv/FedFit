import { workoutCaloriesService } from "./workoutCaloriesService";
import type { WorkoutCalorieUser, WorkoutExerciseCalorieEntry } from "../types/calories";

/**
 * Итоги сессии при ручном завершении тренировки (кнопка «Завершить»), без логики упражнений.
 */
export class WorkoutSessionFinishService {
  resolveManualFinishTotals(input: {
    exerciseLog: readonly WorkoutExerciseCalorieEntry[];
    elapsedSeconds: number;
    calorieUser: WorkoutCalorieUser | null;
    strengthMet: number;
    estimatedCaloriesPerMinute: number;
  }): {
    totalCaloriesBurned: number;
    calorieSummaryFromExercises: boolean;
    exercisesSnapshot: WorkoutExerciseCalorieEntry[];
  } {
    const calorieSummaryFromExercises = input.exerciseLog.length > 0;
    const exercisesSnapshot = [...input.exerciseLog];
    const fromExercises =
      workoutCaloriesService.sumExerciseCaloriesBurned(exercisesSnapshot);

    const fallbackTotal = input.calorieUser
      ? workoutCaloriesService.roundCalories(
          workoutCaloriesService.estimateWorkoutCaloriesFromProfile(
            input.calorieUser,
            input.elapsedSeconds,
            { met: input.strengthMet },
          ),
        )
      : workoutCaloriesService.estimateCaloriesFromDurationAndPerMinuteRate(
          input.elapsedSeconds,
          input.estimatedCaloriesPerMinute,
        );

    const totalCaloriesBurned =
      exercisesSnapshot.length > 0 ? fromExercises : fallbackTotal;

    return {
      totalCaloriesBurned,
      calorieSummaryFromExercises,
      exercisesSnapshot,
    };
  }
}

export const workoutSessionFinishService = new WorkoutSessionFinishService();
