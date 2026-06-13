import { $authReq } from "@/shared/api";
import { WorkoutDetail, TrainingPlan, WorkoutListItem } from "../types";
import { TRAINING_PLANS_URL, WORKOUTS_URL } from "@/shared/constants";

export class WorkoutService {
  constructor() { }

  async getTrainingPlans() {
    const { data } = await $authReq().get<Omit<TrainingPlan, "workouts">[]>(
      `${TRAINING_PLANS_URL}`,
    );
    return data;
  }

  async getPersonalTrainingPlans(userId: number) {
    const { data } = await $authReq().get<Omit<TrainingPlan, "workouts">[]>(
      `${TRAINING_PLANS_URL}/personal/${userId}`,
    );
    return data;
  }

  async getWorkouts() {
    const { data } = await $authReq().get<WorkoutListItem[]>(`${WORKOUTS_URL}`);
    return data;
  }

  async getTrainingPlanById(id: number) {
    const { data } = await $authReq().get<TrainingPlan>(
      `${TRAINING_PLANS_URL}/${id}`,
    );
    return data;
  }

  async getWorkoutDetailById(id: number): Promise<WorkoutDetail> {
    const { data } = await $authReq().get<WorkoutDetail>(
      `${WORKOUTS_URL}/${id}`,
    );
    return data;
  }
}
