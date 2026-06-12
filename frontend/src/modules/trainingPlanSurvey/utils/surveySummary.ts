import {
  DURATION_OPTIONS,
  EQUIPMENT_OPTIONS,
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
  RESTRICTION_OPTIONS,
} from "../constants/surveyOptions";
import type { SurveyFormValues, SurveySummary } from "../types";
import { formatFrequencyLabel } from "./formatFrequency";

function findLabel<T extends { value: string | number; label: string }>(
  options: readonly T[],
  value: string | number | null | undefined
): string {
  if (value == null) return "—";
  return options.find((option) => option.value === value)?.label ?? "—";
}

/** Формирует текст для блока «Итог» на шаге 4. */
export function buildSurveySummary(values: SurveyFormValues): SurveySummary {
  const goalLabel = findLabel(GOAL_OPTIONS, values.goal);
  const levelLabel = findLabel(LEVEL_OPTIONS, values.level);

  const equipmentLabels = values.equipment
    .map((item) => findLabel(EQUIPMENT_OPTIONS, item))
    .filter((label) => label !== "—");

  const restrictionLabels = values.restrictions
    .map((item) =>
      RESTRICTION_OPTIONS.find((option) => option.value === item)?.label
    )
    .filter(Boolean) as string[];

  const durationLabel = values.duration_preference
    ? DURATION_OPTIONS.find((option) => option.value === values.duration_preference)
        ?.label ?? `${values.duration_preference} мин`
    : "—";

  return {
    goalLevel: `${goalLabel} · ${levelLabel}`,
    rhythm:
      values.frequency != null
        ? `${formatFrequencyLabel(values.frequency)} · ${durationLabel}`
        : `— · ${durationLabel}`,
    equipment:
      equipmentLabels.length > 0 ? equipmentLabels.join(", ") : "—",
    restriction:
      restrictionLabels.length > 0
        ? `Ограничение: ${restrictionLabels.join(", ").toLowerCase()}`
        : null,
  };
}
