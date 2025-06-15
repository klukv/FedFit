import { $authReq } from "@/shared/api";
import { Workout } from "./types";
import { WORKOUTS_PLANS_URL } from "@/shared/constants";

export class WorkoutService {
  constructor() {}

  async getWorkoutsById(id: string) {
    console.log(id);
    const { data } = await $authReq().get<Workout[]>(
      `${WORKOUTS_PLANS_URL}/${id}/workouts`,
    );
    return data;
  }
}
