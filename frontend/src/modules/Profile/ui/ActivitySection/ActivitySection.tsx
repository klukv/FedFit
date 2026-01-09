"use client";

import React from "react";
import { Achievement, AchievementModel } from "@/modules/achievement";
import "./activitySection.css";

interface ActivitySectionProps {
  calories: number;
  workouts: number;
  minutes: number;
}

const ActivitySection = ({
  calories,
  workouts,
  minutes,
}: ActivitySectionProps) => {
  const caloriesIconSvg = `
    <svg width="122" height="122" viewBox="0 0 122 122" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M35.58 27.81L50.83 68.77H0L15.32 27.81H35.58Z" stroke="white" stroke-width="5.6" fill="none"/>
      <path d="M17.76 46.33H33.08" stroke="white" stroke-width="5.6" stroke-linecap="round"/>
    </svg>
  `;

  const workoutsIconSvg = `
    <svg width="84" height="81" viewBox="0 0 84 81" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M42 0L50.4 30.6L84 38.7L50.4 46.8L42 81L33.6 46.8L0 38.7L33.6 30.6L42 0Z" fill="white"/>
    </svg>
  `;

  const minutesIconSvg = `
    <svg width="84" height="81" viewBox="0 0 84 81" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="42" cy="40.5" r="35" stroke="white" stroke-width="5" fill="none"/>
      <path d="M42 20.5V40.5L55 53.5" stroke="white" stroke-width="5" stroke-linecap="round"/>
    </svg>
  `;

  const achievements: AchievementModel[] = [
    {
      id: 1,
      icon: caloriesIconSvg,
      value: String(calories),
      text: "калории",
    },
    {
      id: 2,
      icon: workoutsIconSvg,
      value: String(workouts),
      text: "тренировок",
    },
    {
      id: 3,
      icon: minutesIconSvg,
      value: String(minutes),
      text: "минуты",
    },
  ];

  return (
    <div className="activity-section" role="region" aria-label="Моя активность">
      {achievements.map((achievement) => (
        <Achievement key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
};

export default ActivitySection;

