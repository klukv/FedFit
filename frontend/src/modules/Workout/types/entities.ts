export interface TrainingPlan {
  id: number;
  name: string;
  description: string;
  workouts: WorkoutModel[];
}

export interface WorkoutModel {
  id: number;
  name: string;
  value: string;
}

export interface WorkoutListItem {
  id: number;
  name: string;
  value: string;
  description?: string;
  image?: string;
  level: string;
  caloriesMin: number;
  caloriesMax: number;
  duration: number;
  exercisesCount: number;
}

export interface Exercise {
  id: number;
  name: string;
  description: string;
  icon?: string;
  sets: number;
  reps: number;
  duration?: number; // в секундах
}

export interface WorkoutDetail {
  id: number;
  name: string;
  description?: string;
  image?: string;
  level: "Начинающий" | "Средний" | "Продвинутый";
  caloriesMin: number;
  caloriesMax: number;
  duration?: number; // в секундах
  exercisesCount: number;
  exercises: Exercise[];
}