import { $authReq } from "@/shared/api";
import { WorkoutModel, WorkoutDetail } from "../types";
import { USERS_URL, TRAINING_PLANS_URL } from "@/shared/constants";

export class WorkoutService {
  constructor() {}

  async getWorkoutsById(id: number) {
    const { data } = await $authReq().get<WorkoutModel[]>(
      `${TRAINING_PLANS_URL}/${id}/workouts`,
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
      `/workouts/${id}`,
    );
    return data;
  }
}
