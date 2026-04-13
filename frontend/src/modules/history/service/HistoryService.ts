import { $authReq } from "@/shared/api";
import { WORKOUTS_URL } from "@/shared/constants";
import { WorkoutHistory } from "../types";

export class HistoryService {
  async getHistoryWorkouts(id: number): Promise<WorkoutHistory[]> {
    const { data } = await $authReq().get<WorkoutHistory[]>(
      `${WORKOUTS_URL}/history/${id}`,
    );
    return data;
  }

  async addWorkoutToHistory(workoutId: number, userId: number, workoutHistory: WorkoutHistory) {
    await $authReq().post<void>(
      `${WORKOUTS_URL}/history/${workoutId}/${userId}`,
      workoutHistory,
    );
  }
}