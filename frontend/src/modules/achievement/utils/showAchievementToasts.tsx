import toast from "react-hot-toast";
import type { AchievementModel } from "../types";

/** Показывает toast для каждого нового достижения */
export function showAchievementToasts(newAchievements: AchievementModel[]): void {
  if (!newAchievements?.length) return;

  newAchievements.forEach((achievement) => {
    toast.success(
      () => (
        <div className="achievement-toast">
          <div className="achievement-toast__title">🏆 {achievement.title}</div>
          {achievement.description ? (
            <div className="achievement-toast__description">{achievement.description}</div>
          ) : null}
        </div>
      ),
      { id: `achievement-${achievement.id}-${achievement.unlockedAt ?? "new"}` },
    );
  });
}
