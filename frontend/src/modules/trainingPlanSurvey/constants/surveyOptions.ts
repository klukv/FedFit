/** Подписи вариантов анкеты (соответствуют POST /recommend). */

export const SURVEY_STEPS = [
  { id: "goal", label: "Цель" },
  { id: "equipment", label: "Инвентарь" },
  { id: "rhythm", label: "Ритм" },
  { id: "health", label: "Здоровье" },
] as const;

export const GOAL_OPTIONS = [
  { value: "weight_loss", label: "Похудение" },
  { value: "muscle_gain", label: "Набор массы" },
  { value: "endurance", label: "Выносливость" },
  { value: "general_fitness", label: "Общая форма" },
] as const;

export const LEVEL_OPTIONS = [
  { value: "beginner", label: "Начинающий" },
  { value: "intermediate", label: "Средний" },
  { value: "advanced", label: "Продвинутый" },
] as const;

export const EQUIPMENT_OPTIONS = [
  { value: "none", label: "Без инвентаря" },
  { value: "dumbbells", label: "Гантели" },
  { value: "barbell", label: "Штанга" },
  { value: "pullup_bar", label: "Турник" },
  { value: "kettlebell", label: "Гиря" },
] as const;

export const DURATION_OPTIONS = [
  { value: 15, label: "15 мин" },
  { value: 30, label: "30 мин" },
  { value: 45, label: "45 мин" },
  { value: 60, label: "60 мин" },
] as const;

export const RESTRICTION_OPTIONS = [
  { value: "knee", label: "Колени" },
  { value: "back", label: "Спина" },
  { value: "shoulder", label: "Плечи" },
  { value: "none", label: "Нет ограничений" },
] as const;
