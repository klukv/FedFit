import { $authReq } from "@/shared/api";
import { AchievementModel } from "../types";
import { ACHIEVEMENTS_URL, USERS_URL } from "@/shared/constants";

export class AchievementService {
  constructor() {}

  async getAllAchievementsByUser(id: number) {
    const { data } = await $authReq().get<AchievementModel[]>(
      `${USERS_URL}/${id}/${ACHIEVEMENTS_URL}`
    )
    return data;
  }
}