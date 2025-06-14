"use client";

import { WorkoutItem } from "@/modules/workout";
import { Workout, WorkoutItemVariants } from "@/modules/workout/types";

export const ClientWorkoutItem = ({ workout }: { workout: Workout }) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("Переход к тренировке", workout.id);
  };

  return (
    <WorkoutItem
      type={WorkoutItemVariants.LARGE_WITH_BUTTON}
      title={workout.name}
      button={{
        onClickButtonLink: handleClick,
        title: "Перейти",
      }}
      backgroundImage={{ image: "" }}
    />
  );
};
