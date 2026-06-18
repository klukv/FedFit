/** Модель достижения из API GET /users/{id}/achievements */
export interface AchievementModel {
  id: number;
  code: string;
  title: string;
  description: string;
  value: string;
  text: string;
  unlocked: boolean;
  unlockedAt?: string;
}

/** Ответ API при сохранении тренировки или плана с новыми достижениями */
export interface NewAchievementsPayload {
  newAchievements: AchievementModel[];
}
