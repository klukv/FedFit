import { $authReq } from "@/shared/api";

export class WorkoutService {
  constructor() {}

  async getWorkouts(name: string) {
    const { data } = await $authReq().get(`/workouts/${name}`);
    return data;
  }
}
