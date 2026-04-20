import { workoutCaloriesService } from "./workoutCaloriesService";
import type {
  ResolveManualFinishTotalsInput,
  ResolveManualFinishTotalsResult,
} from "../types/calories";

/**
 * Итоги сессии при ручном завершении тренировки (кнопка «Завершить»), без логики упражнений.
 */
export class WorkoutSessionFinishService {
  resolveManualFinishTotals(
    input: ResolveManualFinishTotalsInput,
  ): ResolveManualFinishTotalsResult {
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

    const totalCaloriesBurned = calorieSummaryFromExercises ? fromExercises : fallbackTotal;

    return {
      totalCaloriesBurned,
      calorieSummaryFromExercises,
      exercisesSnapshot,
    };
  }
}

export const workoutSessionFinishService = new WorkoutSessionFinishService();
