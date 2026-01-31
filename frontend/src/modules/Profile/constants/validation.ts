/**
 * Границы валидации полей профиля.
 * Единый источник правды для схемы и полей формы.
 */
export const PROFILE_VALIDATION = {
  name: { minLength: 2, maxLength: 100 },
  gender: { maxLength: 50 },
  height: { min: 100, max: 250 },
  weight: { min: 30, max: 300 },
  desiredWeight: { min: 30, max: 300 },
} as const;
