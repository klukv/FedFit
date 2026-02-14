import { $authReq } from "@/shared/api";
import { WorkoutModel, WorkoutDetail, TrainingPlan } from "../types";
import { USERS_URL, TRAINING_PLANS_URL, WORKOUTS_URL } from "@/shared/constants";

export class WorkoutService {
  constructor() {}

  async getTrainingPlanById(id: number) {
    const { data } = await $authReq().get<TrainingPlan>(
      `${TRAINING_PLANS_URL}/${id}`,
    );
    return data;
  }

  async getHistoryWorkouts(id: number) {
    const { data } = await $authReq().get<WorkoutModel[]>(
      `${USERS_URL}/${id}/history-workouts`,
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
