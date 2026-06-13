/** Уровень подготовки — значения API и БД */
export type WorkoutLevel = "beginner" | "intermediate" | "advanced";

export interface Exercise {
  id: number;
  name: string;
  description: string;
  icon?: string;
  sets?: number;
  reps?: number;
  /* В секундах */
  duration?: number;
}

export interface Workout {
  id: number;
  name: string;
  /** Краткая характеристика для карточек (slug из БД или «45 мин · Средний») */
  value: string;
  description?: string;
  image?: string;
  level: WorkoutLevel | string;
  caloriesMin: number;
  caloriesMax: number;
  /* В минутах */
  duration: number;
  exercisesCount: number;
  exercises?: Exercise[];
}

export interface TrainingPlan {
  id: number;
  name: string;
  description: string;
  workouts: Workout[];
  created_at?: string;
  updated_at?: string;
}

/** План без вложенных тренировок (списки на главной) */
export type TrainingPlanSummary = Omit<TrainingPlan, "workouts">;

/** Тренировка с загруженным списком упражнений */
export type WorkoutWithExercises = Workout & Required<Pick<Workout, "exercises">>;
