import type { z } from "zod";
import type {
  surveyFormSchema,
  surveyGoalSchema,
  surveyLevelSchema,
  surveyEquipmentSchema,
  surveyRestrictionSchema,
  surveyDurationSchema,
} from "../schemas/surveySchema";

export type SurveyGoal = z.infer<typeof surveyGoalSchema>;
export type SurveyLevel = z.infer<typeof surveyLevelSchema>;
export type SurveyEquipment = z.infer<typeof surveyEquipmentSchema>;
export type SurveyRestriction = z.infer<typeof surveyRestrictionSchema>;
export type SurveyDuration = z.infer<typeof surveyDurationSchema>;

export type SurveyStepNumber = 1 | 2 | 3 | 4;

/** Значения формы в UI (поля шагов 1–3 могут быть пустыми до выбора). */
export interface SurveyFormValues {
  goal: SurveyGoal | null;
  level: SurveyLevel | null;
  equipment: SurveyEquipment[];
  frequency: number | null;
  duration_preference: SurveyDuration | null;
  restrictions: SurveyRestriction[];
}

/** Тело запроса POST /v1/training-plans/recommendation */
export type SurveySubmitPayload = z.infer<typeof surveyFormSchema>;

export type SurveyStepDirection = "forward" | "back";

/** Фаза модального окна опросника. */
export type SurveyPhase = "survey" | "generating" | "preview" | "saving";

export interface SurveySummary {
  goalLevel: string;
  rhythm: string;
  equipment: string;
  restriction: string | null;
}
