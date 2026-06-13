import { $authReq } from "@/shared/api";
import { TRAINING_PLANS_URL } from "@/shared/constants";
import type { TrainingPlan } from "@/modules/workout/types";
import {
  normalizeTrainingPlan,
  toSaveTrainingPlanPayload,
} from "@/modules/workout/utils";
import type { SurveySubmitPayload } from "../types";

export class TrainingPlanSurveyService {
  async createFromSurvey(payload: SurveySubmitPayload): Promise<TrainingPlan> {
    const { data } = await $authReq().post<TrainingPlan>(
      `${TRAINING_PLANS_URL}/recommendation`,
      payload
    );

    return normalizeTrainingPlan(data);
  }

  async savePlan(plan: TrainingPlan): Promise<TrainingPlan> {
    await $authReq().post(`${TRAINING_PLANS_URL}`, toSaveTrainingPlanPayload(plan));
    return plan;
  }
}
