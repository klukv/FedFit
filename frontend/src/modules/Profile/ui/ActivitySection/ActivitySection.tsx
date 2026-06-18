"use client";

import { Achievement, AchievementModel } from "@/modules/achievement";
import "./activitySection.css";

interface ActivitySectionProps {
  achievements: AchievementModel[];
}

const ActivitySection = ({ achievements }: ActivitySectionProps) => {
  return (
    <div className="activity-section" role="region" aria-label="Моя активность">
      {achievements.map((achievement) => (
        <Achievement key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
};

export default ActivitySection;
