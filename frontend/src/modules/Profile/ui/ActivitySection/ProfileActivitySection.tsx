"use client";

import { useEffect, useState } from "react";
import { AchievementModel, AchievementService } from "@/modules/achievement";
import ActivitySection from "./ActivitySection";

interface ProfileActivitySectionProps {
  userId: number;
}

const ProfileActivitySection = ({ userId }: ProfileActivitySectionProps) => {
  const [achievements, setAchievements] = useState<AchievementModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const service = new AchievementService();

    service
      .getAllAchievementsByUser(userId)
      .then((data) => setAchievements(data ?? []))
      .catch(() => setAchievements([]))
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) {
    return <p className="activity-section__loading">Загрузка достижений…</p>;
  }

  return <ActivitySection achievements={achievements} />;
};

export default ProfileActivitySection;
