import { $authReq } from "@/shared/api";
import {
  TrainingPlan,
  TrainingPlanSummary,
  Workout,
  WorkoutWithExercises,
} from "../types";
import { TRAINING_PLANS_URL, WORKOUTS_URL } from "@/shared/constants";

export class WorkoutService {
  constructor() {}

  async getTrainingPlans() {
    const { data } = await $authReq().get<TrainingPlanSummary[]>(
      `${TRAINING_PLANS_URL}`,
    );
    return data;
  }

  async getPersonalTrainingPlans(userId: number) {
    const { data } = await $authReq().get<TrainingPlanSummary[]>(
      `${TRAINING_PLANS_URL}/personal/${userId}`,
    );
    return data;
  }

  async getWorkouts() {
    const { data } = await $authReq().get<Workout[]>(`${WORKOUTS_URL}`);
    return data;
  }

  async getTrainingPlanById(id: number) {
    const { data } = await $authReq().get<TrainingPlan>(
      `${TRAINING_PLANS_URL}/${id}`,
    );
    return data;
  }

  async getWorkoutDetailById(id: number): Promise<WorkoutWithExercises> {
    const { data } = await $authReq().get<WorkoutWithExercises>(
      `${WORKOUTS_URL}/${id}`,
    );
    return data;
  }
}
