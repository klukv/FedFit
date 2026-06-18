import type { TrainingPlan, Workout } from "../types/entities";
import { formatWorkoutCardValue } from "./workoutDisplay";

/** Временный id пользователя до появления авторизации */
const SAVE_TRAINING_PLAN_USER_ID = 1;

export function normalizeWorkout(workout: Workout): Workout {
  return {
    ...workout,
    value: workout.value || formatWorkoutCardValue(workout),
  };
}

export function normalizeTrainingPlan(plan: TrainingPlan): TrainingPlan {
  return {
    ...plan,
    workouts: plan.workouts.map(normalizeWorkout),
  };
}

export function toSaveTrainingPlanPayload(plan: TrainingPlan) {
  return {
    name: plan.name,
    description: plan.description,
    userId: SAVE_TRAINING_PLAN_USER_ID,
    workouts: plan.workouts.map(({ value, ...workout }) => ({
      ...workout,
      ...(workout.id > 0 && value ? { value } : {}),
    })),
  };
}
