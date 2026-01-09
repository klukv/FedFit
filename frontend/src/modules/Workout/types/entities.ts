export interface WorkoutModel {
  id: number;
  name: string;
  value: string;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  icon?: string;
  sets?: number;
  reps?: number;
  duration?: number; // в секундах
  restTime?: number; // в секундах
}

export interface WorkoutDetail {
  id: number;
  name: string;
  description?: string;
  image?: string;
  exercisesCount: number;
  duration: number; // в минутах
  level: "Начинающий" | "Средний" | "Продвинутый";
  caloriesMin: number;
  caloriesMax: number;
  exercises: Exercise[];
}