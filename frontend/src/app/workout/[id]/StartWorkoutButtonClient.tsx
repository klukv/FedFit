"use client";

import { ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";

interface StartWorkoutButtonClientProps {
  workoutId: number;
}

const StartWorkoutButtonClient = ({
  workoutId,
}: StartWorkoutButtonClientProps) => {
  return (
    <div className="workout-detail-page__start-button">
      <ButtonLink
        type={ButtonLinkTypes.Button}
        title="Начать тренировку"
        variant="default"
        onClickHandler={() => {
          // TODO: Implement workout start functionality
          // Например, переход на страницу выполнения тренировки или открытие модального окна
          console.log("Starting workout:", workoutId);
        }}
      />
    </div>
  );
};

export default StartWorkoutButtonClient;

