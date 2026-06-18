import type { Exercise } from "../types";
import { formatDuration } from "./format";

type ExercisePrescription = Pick<Exercise, "sets" | "reps" | "duration">;

/**
 * Форматирует план упражнения для карточки в списке.
 * Если подходов нет или повторов нет — упражнение выполняется на время.
 */
export function formatExercisePrescription(exercise: ExercisePrescription): string {
  const { sets, reps, duration } = exercise;

  if (sets != null && reps != null) {
    return `${sets} x ${reps}`;
  }

  if (sets != null) {
    return `${sets} x на время`;
  }

  if (reps != null) {
    return `${reps} на время`;
  }

  if (duration != null && duration > 0) {
    return `${formatDuration(duration)} · на время`;
  }

  return "на время";
}
