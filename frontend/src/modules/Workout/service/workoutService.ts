import { $authReq } from "@/shared/api";
import { WorkoutModel } from "../types";
import { USERS_URL, WORKOUTS_PLANS_URL } from "@/shared/constants";

export class WorkoutService {
  constructor() {}

  async getWorkoutsById(id: number) {
    const { data } = await $authReq().get<WorkoutModel[]>(
      `${WORKOUTS_PLANS_URL}/${id}/workouts`,
    );
    return data;
  }

  async getHistoryWorkouts(id: number) {
    const { data } = await $authReq().get<WorkoutModel[]>(
      `${USERS_URL}/${id}/history-workouts`,
    );
    return data;
  }
}
