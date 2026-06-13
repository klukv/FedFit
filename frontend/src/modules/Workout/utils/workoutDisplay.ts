import { WORKOUT_LEVEL_LABELS } from "../constants/workoutLevel";
import type { Workout, WorkoutLevel } from "../types/entities";

/** Локализованная подпись уровня тренировки */
export function formatWorkoutLevelLabel(level: string): string {
  return WORKOUT_LEVEL_LABELS[level as WorkoutLevel] ?? level;
}

/** Строка для карточки тренировки: «45 мин · Средний» */
export function formatWorkoutCardValue(
  workout: Pick<Workout, "duration" | "level">
): string {
  return `${workout.duration} мин · ${formatWorkoutLevelLabel(workout.level)}`;
}
