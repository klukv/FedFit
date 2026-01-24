import { pluralize } from "@/shared/utils";

/**
 * Форматирует длительность в секундах в читаемую строку
 * @param totalSeconds - общее количество секунд
 * @returns Отформатированная строка (например, "5 минут" или "30 секунд")
 */
export const formatDuration = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);

  if (minutes < 1) {
    const secondsForm = pluralize(totalSeconds, [
      "секунда",
      "секунды",
      "секунд",
    ]);
    return `${totalSeconds} ${secondsForm}`;
  }

  const minutesForm = pluralize(minutes, ["минута", "минуты", "минут"]);
  return `${minutes} ${minutesForm}`;
};

/**
 * Форматирует количество калорий с правильным склонением
 * @param calories - количество калорий
 * @returns Отформатированная строка с переносом строки
 */
export const formatCalories = (calories: number): string => {
  const caloriesForm = pluralize(calories, ["калория", "калории", "калорий"]);
  return `${calories}\n${caloriesForm}`;
};
