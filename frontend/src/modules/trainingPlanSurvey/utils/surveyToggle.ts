import type { SurveyEquipment, SurveyRestriction } from "../types";

/** Переключение инвентаря: «Без инвентаря» исключает остальные варианты. */
export function toggleEquipment(
  current: SurveyEquipment[],
  value: SurveyEquipment
): SurveyEquipment[] {
  if (value === "none") {
    return current.includes("none") ? [] : ["none"];
  }

  const withoutNone = current.filter((item) => item !== "none");

  if (withoutNone.includes(value)) {
    const next = withoutNone.filter((item) => item !== value);
    return next;
  }

  return [...withoutNone, value];
}

/** Переключение ограничений (мультивыбор). */
export function toggleRestriction(
  current: SurveyRestriction[],
  value: SurveyRestriction
): SurveyRestriction[] {
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }
  return [...current, value];
}

export function isEquipmentSelected(
  current: SurveyEquipment[],
  value: SurveyEquipment
): boolean {
  return current.includes(value);
}

export function isRestrictionSelected(
  current: SurveyRestriction[],
  value: SurveyRestriction
): boolean {
  return current.includes(value);
}

/** «Нет ограничений» — пустой список ограничений. */
export function isNoRestrictionsSelected(restrictions: SurveyRestriction[]): boolean {
  return restrictions.length === 0;
}
