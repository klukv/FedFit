/**
 * Антропометрия и пол для расчёта расхода энергии во время тренировки.
 * Возраст опционален: при отсутствии в профиле используется значение по умолчанию в WorkoutCaloriesService.
 */
export interface WorkoutCalorieUser {
  weightKg: number;
  heightCm: number;
  gender: string;
  ageYears?: number;
}

/** Одна завершённая «серия» учёта по упражнению (удобно отправлять на бекенд). */
export interface WorkoutExerciseCalorieEntry {
  exerciseIndex: number;
  durationSeconds: number;
  setsCompleted: number;
  caloriesBurned: number;
}

/** Итог сессии: сумма по упражнениям + метаданные для API истории. */
export interface WorkoutCaloriesSessionResult {
  workoutId: number;
  totalDurationSeconds: number;
  totalCaloriesBurned: number;
  exercises: WorkoutExerciseCalorieEntry[];
}
