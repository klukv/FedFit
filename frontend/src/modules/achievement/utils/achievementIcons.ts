import type { IconType } from "react-icons";
import { FiActivity, FiAward, FiCalendar, FiZap } from "react-icons/fi";

/** Иконки достижений по коду (Feather Icons — единый стиль с остальным UI) */
const ACHIEVEMENT_ICONS: Record<string, IconType> = {
  first_workout: FiActivity,
  first_plan: FiCalendar,
  first_calories: FiZap,
};

/** Возвращает компонент иконки по коду достижения */
export function getAchievementIconByCode(code: string): IconType {
  return ACHIEVEMENT_ICONS[code] ?? FiAward;
}
