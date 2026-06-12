import { $authReq } from "@/shared/api";
import { TRAINING_PLANS_URL } from "@/shared/constants";
import type { TrainingPlan } from "@/modules/workout/types";
import {
  USE_MOCK_TRAINING_PLAN,
  delayMockPlan,
} from "../constants/mockTrainingPlan";
import type { SurveySubmitPayload } from "../types";

export class TrainingPlanSurveyService {
  async createFromSurvey(payload: SurveySubmitPayload) {
    if (USE_MOCK_TRAINING_PLAN) {
      void payload;
      return delayMockPlan();
    }

    const { data } = await $authReq().post<TrainingPlan>(
      `${TRAINING_PLANS_URL}/recommendation`,
      payload
    );
    return data;
  }

  async savePlan(plan: TrainingPlan) {
    if (USE_MOCK_TRAINING_PLAN) {
      await new Promise((resolve) => window.setTimeout(resolve, 800));
      return { ...plan, id: plan.id || 1 };
    }

    await $authReq().post(`${TRAINING_PLANS_URL}`, {
      name: plan.name,
      description: plan.description,
      workouts: plan.workouts,
    });

    return plan;
  }
}
