import { $authReq } from "@/shared/api";
import { WORKOUTS_URL } from "@/shared/constants";
import type { NewAchievementsPayload } from "@/modules/achievement";
import { WorkoutHistory } from "../types";

class HistoryService {
  async getHistoryWorkouts(id: number): Promise<WorkoutHistory[]> {
    const { data } = await $authReq().get<WorkoutHistory[] | null>(
      `${WORKOUTS_URL}/history/${id}`,
    );
    return data ?? [];
  }

  async getLatestUnfinishedWorkoutHistoryByWorkoutId(
    userId: number,
    workoutId: number,
  ): Promise<WorkoutHistory | null> {
    const historyList = await this.getHistoryWorkouts(userId);

    const filtered = historyList
      .filter(
        (item) =>
          item.workoutForHistory.workoutId === workoutId &&
          !item.workoutForHistory.isCompleted,
      )
      .sort(
        (a, b) =>
          new Date(b.workoutForHistory.startedAt).getTime() -
          new Date(a.workoutForHistory.startedAt).getTime(),
      );

    return filtered[0] ?? null;
  }

  async addWorkoutToHistory(
    workoutId: number,
    userId: number,
    workoutHistory: WorkoutHistory,
  ): Promise<NewAchievementsPayload> {
    const { data } = await $authReq().post<NewAchievementsPayload>(
      `${WORKOUTS_URL}/history/${workoutId}/${userId}`,
      workoutHistory,
    );
    return data ?? { newAchievements: [] };
  }

  async updateWorkoutInHistory(
    workoutHistoryId: number,
    workoutHistory: WorkoutHistory,
  ): Promise<NewAchievementsPayload> {
    const { data } = await $authReq().put<NewAchievementsPayload>(
      `${WORKOUTS_URL}/history/${workoutHistoryId}`,
      workoutHistory,
    );
    return data ?? { newAchievements: [] };
  }
}

export const historyService = new HistoryService();
