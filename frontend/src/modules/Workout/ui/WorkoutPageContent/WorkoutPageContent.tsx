"use client";

import { useState, useEffect, useRef, ReactNode } from "react";
import { ButtonLink, IconButton } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";
import { PauseIcon, PlayIcon } from "@/shared/icons";
import { WorkoutCompleteModal } from "@/modules/workout";
import { IoIosTimer } from "react-icons/io";
import { BsCardChecklist } from "react-icons/bs";
import { FaHourglassStart } from "react-icons/fa";
import "./workout-controls.css";
import { drawWorkoutProgressBar } from "./utils";

interface WorkoutPageContentProps {
  workoutId: number;
  exerciseList: ReactNode;
  exercisesCount: number;
  infoBlock: ReactNode;
  estimatedCaloriesPerMinute?: number;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`;
};

const WorkoutPageContent = ({
  exerciseList,
  infoBlock,
  exercisesCount,
  estimatedCaloriesPerMinute = 13,
}: WorkoutPageContentProps) => {
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [finalElapsedTime, setFinalElapsedTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [completedExercisesCount, setCompletedExercisesCount] = useState(0);
  const [isStartedExercise, setIsStartedExercise] = useState(false);

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
    setIsStartedExercise(true);
    setIsPaused(false);
    setElapsedSeconds(0);
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const handleFinishExercise = () => {
    setCompletedExercisesCount((ps) => {
      const newCount = ps + 1;
      if (newCount === exercisesCount) handleFinishWorkout();
      return newCount;
    });
    setIsStartedExercise(false);
  }

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

  return (
    <>
      {isWorkoutStarted && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "25px" }}>
          <h1 style={{ fontSize: 35 }}>Прогресс выполнения</h1>
          {drawWorkoutProgressBar(completedExercisesCount, exercisesCount)}
        </div>
      )}
      {/* Блок с информацией о тренировке (с анимацией) */}
      <div
        className={`workout-info-animated ${isWorkoutStarted ? "workout-info-animated--hidden" : "workout-info-animated--visible"
          }`}
      >
        {infoBlock}
      </div>

      {/* Таймер (с анимацией появления) */}
      <div
        className={`workout-timer ${isWorkoutStarted ? "workout-timer--visible" : "workout-timer--hidden"
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
        className={`workout-detail-page__start-button ${isWorkoutStarted
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
        className={`workout-active-controls ${isWorkoutStarted
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
          {
            isStartedExercise ? (
              <ButtonLink
                type={ButtonLinkTypes.Button}
                icon={<IoIosTimer />}
                description="Завершить упражнение"
                variant="default"
                onClickHandler={handleFinishExercise}
              />
            ) : (
              <ButtonLink
                type={ButtonLinkTypes.Button}
                icon={<FaHourglassStart />}
                description="Начать упражнение"
                variant="default"
                onClickHandler={() => setIsStartedExercise(true)}
              />
            )
          }
          {/* Кнопка завершения */}
          <ButtonLink
            type={ButtonLinkTypes.Button}
            icon={<BsCardChecklist />}
            description="Завершить тренировку"
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
        isCompleteWorkout={exercisesCount === completedExercisesCount}
      />
    </>
  );
};

export default WorkoutPageContent;
