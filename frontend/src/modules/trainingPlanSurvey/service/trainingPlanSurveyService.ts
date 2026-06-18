import { $authReq } from "@/shared/api";
import { TRAINING_PLANS_URL } from "@/shared/constants";
import type { AchievementModel } from "@/modules/achievement";
import type { TrainingPlan } from "@/modules/workout/types";
import {
  normalizeTrainingPlan,
  toSaveTrainingPlanPayload,
} from "@/modules/workout/utils";
import type { SurveySubmitPayload } from "../types";

interface SaveTrainingPlanResponse {
  id: number;
  message: string;
  newAchievements: AchievementModel[];
}

export interface SaveTrainingPlanResult {
  plan: TrainingPlan;
  newAchievements: AchievementModel[];
}

export class TrainingPlanSurveyService {
  async createFromSurvey(payload: SurveySubmitPayload): Promise<TrainingPlan> {
    const { data } = await $authReq().post<TrainingPlan>(
      `${TRAINING_PLANS_URL}/recommendation`,
      payload
    );

    return normalizeTrainingPlan(data);
  }

  async savePlan(plan: TrainingPlan): Promise<SaveTrainingPlanResult> {
    const { data } = await $authReq().post<SaveTrainingPlanResponse>(
      `${TRAINING_PLANS_URL}`,
      toSaveTrainingPlanPayload(plan),
    );

    if (!data?.id) {
      throw new Error("Сервер не вернул id сохранённого плана");
    }

    return {
      plan: { ...plan, id: data.id },
      newAchievements: data.newAchievements ?? [],
    };
  }
}
