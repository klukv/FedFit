"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { ButtonLink, IconButton } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";
import { PauseIcon, PlayIcon } from "@/shared/icons";
import { WorkoutCompleteModal } from "@/modules/Workout";
import "./_styles/workout-controls.css";

interface WorkoutPageContentProps {
  workoutId: number;
  exerciseList: ReactNode;
  infoBlock: ReactNode;
  estimatedCaloriesPerMinute?: number;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`;
};

const WorkoutPageContent = ({
  workoutId,
  exerciseList,
  infoBlock,
  estimatedCaloriesPerMinute = 13,
}: WorkoutPageContentProps) => {
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [finalElapsedTime, setFinalElapsedTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Управление таймером
  useEffect(() => {
    if (isWorkoutStarted && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (!intervalRef.current) return;

      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isWorkoutStarted, isPaused]);

  const handleStartWorkout = () => {
    setIsWorkoutStarted(true);
    setIsPaused(false);
    setElapsedSeconds(0);
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const handleFinishWorkout = () => {
    // Сохраняем время для отображения в модальном окне
    setFinalElapsedTime(elapsedSeconds);
    // Открываем модальное окно
    setIsCompleteModalOpen(true);
    // Останавливаем таймер
    setIsPaused(true);
  };

  const handleCompleteAndClose = () => {
    setIsCompleteModalOpen(false);
    // Сбрасываем состояние тренировки
    setIsWorkoutStarted(false);
    setIsPaused(false);
    setElapsedSeconds(0);
  };

  const handleContinueWorkout = () => {
    setIsCompleteModalOpen(false);
    // Продолжаем тренировку
    setIsPaused(false);
  };

  // Расчёт калорий на основе времени тренировки
  const estimatedCalories = Math.round(
    (finalElapsedTime / 60) * estimatedCaloriesPerMinute
  );

  // Убираем предупреждение о неиспользуемой переменной
  void workoutId;

  return (
    <>
      {/* Блок с информацией о тренировке (с анимацией) */}
      <div
        className={`workout-info-animated ${
          isWorkoutStarted ? "workout-info-animated--hidden" : "workout-info-animated--visible"
        }`}
      >
        {infoBlock}
      </div>

      {/* Таймер (с анимацией появления) */}
      <div
        className={`workout-timer ${
          isWorkoutStarted ? "workout-timer--visible" : "workout-timer--hidden"
        }`}
        role="timer"
        aria-live="off"
      >
        <span className="workout-timer__time">{formatTime(elapsedSeconds)}</span>
      </div>

      {/* Список упражнений */}
      <div className="workout-detail-page__exercises">
        {exerciseList}
      </div>

      {/* Кнопка начала тренировки (с анимацией) */}
      <div
        className={`workout-detail-page__start-button ${
          isWorkoutStarted
            ? "workout-detail-page__start-button--hidden"
            : "workout-detail-page__start-button--visible"
        }`}
      >
        <ButtonLink
          type={ButtonLinkTypes.Button}
          title="Начать тренировку"
          variant="default"
          onClickHandler={handleStartWorkout}
        />
      </div>

      {/* Кнопки управления (с анимацией появления) */}
      <div
        className={`workout-active-controls ${
          isWorkoutStarted
            ? "workout-active-controls--visible"
            : "workout-active-controls--hidden"
        }`}
      >
        <div className="workout-controls">
          {/* Кнопка паузы */}
          <IconButton
            icon={isPaused ? <PlayIcon /> : <PauseIcon />}
            label={isPaused ? "Продолжить" : "Пауза"}
            onClick={handlePauseResume}
            ariaLabel={isPaused ? "Продолжить тренировку" : "Поставить на паузу"}
          />

          {/* Кнопка завершения */}
          <ButtonLink
            type={ButtonLinkTypes.Button}
            title="Завершить тренировку"
            variant="default"
            onClickHandler={handleFinishWorkout}
          />
        </div>
      </div>

      {/* Модальное окно завершения тренировки */}
      <WorkoutCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={handleCompleteAndClose}
        onContinue={handleContinueWorkout}
        elapsedTime={finalElapsedTime}
        estimatedCalories={estimatedCalories}
      />
    </>
  );
};

export default WorkoutPageContent;
