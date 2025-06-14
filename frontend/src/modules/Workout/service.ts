import { $authReq } from "@/shared/api";
import { Workout } from "./types";

export class WorkoutService {
  constructor() {}

  async getWorkoutsById(id: string) {
    const { data } = await $authReq().get<Workout[]>(
      `/workouts_plans/${id}/workouts`,
    );
    return data;
  }
}
