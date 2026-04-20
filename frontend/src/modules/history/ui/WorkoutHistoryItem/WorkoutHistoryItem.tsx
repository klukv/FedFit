"use client";

import { FiCheck, FiClock } from "react-icons/fi";
import clsx from "clsx";
import { ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";
import type { WorkoutHistory } from "../../types";
import {
  buildResumeWorkoutHref,
  formatHistoryDate,
  formatHistoryTimeRange,
} from "../../utils";
import "./workoutHistoryItem.css";

interface WorkoutHistoryItemProps {
  item: WorkoutHistory;
}

export function WorkoutHistoryItem({ item }: WorkoutHistoryItemProps) {
  const completedExercises = item.exercises.filter((exercise) => exercise.isCompleted).length;
  const totalExercises = item.exercises.length;
  const progressPercent = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
  const isCompleted = item.workoutForHistory.isCompleted;
  const resumeHref = buildResumeWorkoutHref(item.workoutForHistory.id);

  return (
    <article className="history-workout-item">
      <header className="history-workout-item__header">
        <div className="history-workout-item__date-wrap">
          <span className="history-workout-item__date">
            {formatHistoryDate(item.workoutForHistory.startedAt)}
          </span>
          <span className="history-workout-item__time">
            {formatHistoryTimeRange(item.workoutForHistory.startedAt, item.workoutForHistory.finishedAt)}
          </span>
        </div>
        <span
          className={clsx("history-workout-item__status", {
            "history-workout-item__status--complete": item.workoutForHistory.isCompleted,
            "history-workout-item__status--pending": !item.workoutForHistory.isCompleted,
          })}
        >
          {item.workoutForHistory.isCompleted ? "Завершена" : "Не завершена"}
        </span>
      </header>

      <h3 className="history-workout-item__title">Тренировка #{item.workoutForHistory.id}</h3>

      <div className="history-workout-item__stats">
        <div className="history-workout-item__stat">
          <span className="history-workout-item__stat-value">{item.workoutForHistory.totalCalories}</span>
          <span className="history-workout-item__stat-label">ккал</span>
        </div>
        <div className="history-workout-item__stat">
          <span className="history-workout-item__stat-value">{item.workoutForHistory.totalDuration}</span>
          <span className="history-workout-item__stat-label">мин</span>
        </div>
        <div className="history-workout-item__stat">
          <span className="history-workout-item__stat-value">{totalExercises}</span>
          <span className="history-workout-item__stat-label">упр.</span>
        </div>
      </div>

      <div className="history-workout-item__progress-wrap">
        <div className="history-workout-item__progress-caption">
          <span>Выполнено</span>
          <span>
            {completedExercises} / {totalExercises}
          </span>
        </div>
        <div className="history-workout-item__progress-bar">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="history-workout-item__exercise-list">
        {item.exercises.slice(0, 5).map((exercise, index) => (
          <div key={exercise.id} className="history-workout-item__exercise-row">
            <span className="history-workout-item__exercise-index">{index + 1}</span>
            <span>{exercise.repsDone}x{exercise.setsDone}</span>
            <span>{exercise.durationDone} мин</span>
            <span>{exercise.caloriesBurned} ккал</span>
            <span
              className={clsx("history-workout-item__exercise-state", {
                "history-workout-item__exercise-state--done": exercise.isCompleted,
              })}
            >
              {exercise.isCompleted ? <FiCheck size={12} /> : <FiClock size={12} />}
            </span>
          </div>
        ))}
      </div>

      <div className="history-workout-item__action">
        <ButtonLink
          type={isCompleted ? ButtonLinkTypes.Button : ButtonLinkTypes.Link}
          {...(isCompleted
            ? {
                buttonType: "button" as const,
                onClickHandler: () => {},
              }
            : { href: resumeHref })}
          variant={isCompleted ? "tertiary" : "default"}
          title={isCompleted ? "Просмотр" : "Продолжить"}
        />
      </div>
    </article>
  );
}
