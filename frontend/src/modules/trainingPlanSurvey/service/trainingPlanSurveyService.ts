import { $authReq } from "@/shared/api";
import { TRAINING_PLANS_URL } from "@/shared/constants";
import type { TrainingPlan } from "@/modules/workout/types";
import type { SurveySubmitPayload } from "../types";

export class TrainingPlanSurveyService {
  async createFromSurvey(payload: SurveySubmitPayload) {
    const { data } = await $authReq().post<TrainingPlan>(
      `${TRAINING_PLANS_URL}/recommendation`,
      payload
    );
    return data;
  }
}
