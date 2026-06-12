import type { SurveyFormValues, SurveySubmitPayload } from "../types";

/** Преобразует значения формы в тело запроса к API. */
export function toSurveySubmitPayload(
  values: SurveyFormValues
): SurveySubmitPayload | null {
  const { goal, level, frequency, duration_preference } = values;

  if (goal == null || level == null || frequency == null || duration_preference == null) {
    return null;
  }

  return {
    goal,
    level,
    equipment: values.equipment,
    frequency,
    duration_preference,
    restrictions: values.restrictions ?? [],
    muscleGroup: [],
  };
}
