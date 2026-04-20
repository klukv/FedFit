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
  id: number,
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

export interface EstimateExerciseCaloriesPreviewInput {
  calorieUser: WorkoutCalorieUser | null;
  exerciseDurationSeconds: number;
  strengthMet: number;
  plannedSetsSafe: number;
  setsDone: number;
  kcalPerMinuteFallback: number;
}

export interface BuildWorkoutExerciseCalorieEntryInput {
  exerciseId: number;
  exerciseIndex: number;
  durationSeconds: number;
  setsCompleted: number;
  calorieUser: WorkoutCalorieUser | null;
  strengthMet: number;
  plannedSets: number;
  kcalPerMinuteFallback: number;
}

export interface ResolveManualFinishTotalsInput {
  exerciseLog: readonly WorkoutExerciseCalorieEntry[];
  elapsedSeconds: number;
  calorieUser: WorkoutCalorieUser | null;
  strengthMet: number;
  estimatedCaloriesPerMinute: number;
}

export interface ResolveManualFinishTotalsResult {
  totalCaloriesBurned: number;
  calorieSummaryFromExercises: boolean;
  exercisesSnapshot: WorkoutExerciseCalorieEntry[];
}
