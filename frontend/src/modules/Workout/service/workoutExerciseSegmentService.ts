import { workoutCaloriesService } from "./workoutCaloriesService";
import type { Exercise } from "../types";
import type {
  BuildWorkoutExerciseCalorieEntryInput,
  WorkoutExerciseCalorieEntry,
} from "../types/calories";

/**
 * Логика «текущего упражнения»: длительность сегмента, план подходов, запись в журнал калорий.
 * !!! Не смешивать с таймером всей тренировки и финализацией сессии.
 */
export class WorkoutExerciseSegmentService {
  resolvePlannedSets(
    exercises: Exercise[] | undefined,
    completedExerciseIndex: number,
    fallback: number,
  ): number {
    const fromPlan = exercises?.[completedExerciseIndex]?.sets;
    if (typeof fromPlan === "number" && fromPlan > 0) return fromPlan;
    return fallback;
  }

  computeSegmentDuration(elapsedAtEnd: number, segmentStart: number): number {
    return Math.max(0, elapsedAtEnd - segmentStart);
  }

  buildCalorieEntry(
    input: BuildWorkoutExerciseCalorieEntryInput,
  ): WorkoutExerciseCalorieEntry {
    const caloriesBurned = input.calorieUser
      ? workoutCaloriesService.roundCalories(
          workoutCaloriesService.estimateWorkoutCaloriesFromProfile(
            input.calorieUser,
            input.durationSeconds,
            {
              met: input.strengthMet,
              plannedSets: input.plannedSets,
              setsDone: input.setsCompleted,
            },
          ),
        )
      : workoutCaloriesService.estimateFallbackWithSets(
          input.durationSeconds,
          input.kcalPerMinuteFallback,
          input.setsCompleted,
          input.plannedSets,
        );

    return {
      id: input.exerciseId,
      exerciseIndex: input.exerciseIndex,
      durationSeconds: input.durationSeconds,
      setsCompleted: input.setsCompleted,
      caloriesBurned,
    };
  }
}

export const workoutExerciseSegmentService = new WorkoutExerciseSegmentService();
