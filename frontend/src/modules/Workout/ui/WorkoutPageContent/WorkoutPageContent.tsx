"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  ReactNode,
} from "react";
import { ButtonLink, IconButton } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";
import { PauseIcon, PlayIcon } from "@/shared/icons";
import { IoIosTimer } from "react-icons/io";
import { BsCardChecklist } from "react-icons/bs";
import { FaHourglassStart } from "react-icons/fa";
import { drawWorkoutProgressBar } from "./utils";
import { WorkoutExercisesCountModal } from "../WorkoutExercisesCountModal";
import { WorkoutCompleteModal } from "../WorkoutCompleteModal";
import { workoutCaloriesService } from "../../service";
import type { Exercise, WorkoutDetail } from "../../types";
import type {
  WorkoutCalorieUser,
  WorkoutCaloriesSessionResult,
  WorkoutExerciseCalorieEntry,
} from "../../types/calories";
import "./workout-controls.css";

interface WorkoutPageContentProps {
  workoutId: number;
  exerciseList: ReactNode;
  exercisesCount: number;
  infoBlock: ReactNode;
  exercises?: Exercise[];
  calorieUser?: WorkoutCalorieUser | null;
  workoutLevel?: WorkoutDetail["level"];
  plannedSetsFallback?: number;
  estimatedCaloriesPerMinute?: number;
  onWorkoutCaloriesComputed?: (payload: WorkoutCaloriesSessionResult) => void;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`;
};

const WorkoutPageContent = (pageProps: WorkoutPageContentProps) => {
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isCompleteExerciseOpen, setIsCompleteExerciseOpen] = useState(false);
  const [finalElapsedTime, setFinalElapsedTime] = useState(0);
  const [finalTotalCalories, setFinalTotalCalories] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [completedExercisesCount, setCompletedExercisesCount] = useState(0);
  const [isStartedExercise, setIsStartedExercise] = useState(false);

  const exerciseSegmentStartRef = useRef(0);
  const elapsedAtSegmentEndRef = useRef(0);
  const exerciseCalorieLogRef = useRef<WorkoutExerciseCalorieEntry[]>([]);

  const [exerciseModalDurationSec, setExerciseModalDurationSec] = useState(0);
  const [calorieSummaryFromExercises, setCalorieSummaryFromExercises] =
    useState(false);

  const strengthMet = useMemo(
    () => workoutCaloriesService.resolveStrengthMetByLevel(pageProps.workoutLevel),
    [pageProps.workoutLevel],
  );

  const plannedSetsFallback = pageProps.plannedSetsFallback ?? 5;
  const estimatedCaloriesPerMinute =
    pageProps.estimatedCaloriesPerMinute ?? 13;

  const plannedSetsForCurrentExercise = (() => {
    const fromPlan = pageProps.exercises?.[completedExercisesCount]?.sets;
    if (typeof fromPlan === "number" && fromPlan > 0) return fromPlan;
    return plannedSetsFallback;
  })();

  const emitSessionPayload = useCallback(
    (
      totalDuration: number,
      overrides?: { totalCaloriesBurned?: number; exercises?: WorkoutExerciseCalorieEntry[] },
    ) => {
      const exercisesPayload =
        overrides?.exercises ?? [...exerciseCalorieLogRef.current];
      const totalCaloriesBurned =
        overrides?.totalCaloriesBurned ??
        workoutCaloriesService.sumExerciseCaloriesBurned(exercisesPayload);
      pageProps.onWorkoutCaloriesComputed?.({
        workoutId: pageProps.workoutId,
        totalDurationSeconds: totalDuration,
        totalCaloriesBurned,
        exercises: exercisesPayload,
      });
    },
    [pageProps.workoutId, pageProps.onWorkoutCaloriesComputed],
  );

  const resetSessionTracking = useCallback(() => {
    exerciseCalorieLogRef.current = [];
    exerciseSegmentStartRef.current = 0;
    elapsedAtSegmentEndRef.current = 0;
    setFinalTotalCalories(0);
  }, []);

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
    resetSessionTracking();
    setIsWorkoutStarted(true);
    setIsStartedExercise(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    exerciseSegmentStartRef.current = 0;
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const handleStartExercise = () => {
    setIsStartedExercise(true);
    setIsPaused(false);
    exerciseSegmentStartRef.current = elapsedSeconds;
  };

  const handleFinishWorkout = () => {
    setFinalElapsedTime(elapsedSeconds);
    const hasExerciseSegments = exerciseCalorieLogRef.current.length > 0;
    setCalorieSummaryFromExercises(hasExerciseSegments);
    const fromExercises = workoutCaloriesService.sumExerciseCaloriesBurned(
      exerciseCalorieLogRef.current,
    );
    const calorieUser = pageProps.calorieUser ?? null;
    const fallbackTotal = calorieUser
      ? workoutCaloriesService.roundCalories(
          workoutCaloriesService.estimateWorkoutCaloriesFromProfile(
            calorieUser,
            elapsedSeconds,
            { met: strengthMet },
          ),
        )
      : workoutCaloriesService.estimateCaloriesFromDurationAndPerMinuteRate(
          elapsedSeconds,
          estimatedCaloriesPerMinute,
        );
    const exercisesSnapshot = [...exerciseCalorieLogRef.current];
    const total =
      exercisesSnapshot.length > 0 ? fromExercises : fallbackTotal;
    setFinalTotalCalories(total);
    emitSessionPayload(elapsedSeconds, {
      totalCaloriesBurned: total,
      exercises: exercisesSnapshot,
    });
    setIsCompleteModalOpen(true);
    setIsPaused(true);
  };

  const handleCompleteWorkoutAndClose = () => {
    setIsCompleteModalOpen(false);
    setIsWorkoutStarted(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    resetSessionTracking();
    setCompletedExercisesCount(0);
    setIsStartedExercise(false);
    setCalorieSummaryFromExercises(false);
  };

  const finishExercise = (completedSets: number) => {
    const durationSec = Math.max(
      0,
      elapsedAtSegmentEndRef.current - exerciseSegmentStartRef.current,
    );

    const calorieUser = pageProps.calorieUser ?? null;
    const caloriesBurned = calorieUser
      ? workoutCaloriesService.roundCalories(
          workoutCaloriesService.estimateWorkoutCaloriesFromProfile(
            calorieUser,
            durationSec,
            {
              met: strengthMet,
              plannedSets: plannedSetsForCurrentExercise,
              setsDone: completedSets,
            },
          ),
        )
      : workoutCaloriesService.estimateFallbackWithSets(
          durationSec,
          estimatedCaloriesPerMinute,
          completedSets,
          plannedSetsForCurrentExercise,
        );

    const entry: WorkoutExerciseCalorieEntry = {
      exerciseIndex: completedExercisesCount,
      durationSeconds: durationSec,
      setsCompleted: completedSets,
      caloriesBurned,
    };
    exerciseCalorieLogRef.current = [...exerciseCalorieLogRef.current, entry];

    const nextCompleted = completedExercisesCount + 1;
    setCompletedExercisesCount(nextCompleted);

    if (nextCompleted === pageProps.exercisesCount) {
      setFinalElapsedTime(elapsedSeconds);
      setCalorieSummaryFromExercises(true);
      const total = workoutCaloriesService.sumExerciseCaloriesBurned(
        exerciseCalorieLogRef.current,
      );
      setFinalTotalCalories(total);
      emitSessionPayload(elapsedSeconds);
      setIsCompleteModalOpen(true);
      setIsPaused(true);
    } else {
      handlePauseResume();
    }

    setIsStartedExercise(false);
  };

  const handleContinueWorkout = () => {
    setIsCompleteModalOpen(false);
    setIsPaused(false);
  };

  const openExerciseCompleteModal = () => {
    const end = elapsedSeconds;
    elapsedAtSegmentEndRef.current = end;
    setExerciseModalDurationSec(Math.max(0, end - exerciseSegmentStartRef.current));
    setIsCompleteExerciseOpen(true);
  };

  return (
    <>
      {isWorkoutStarted && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "25px",
          }}
        >
          <h1 style={{ fontSize: 35 }}>Прогресс выполнения</h1>
          {drawWorkoutProgressBar(completedExercisesCount, pageProps.exercisesCount)}
        </div>
      )}
      <div
        className={`workout-info-animated ${isWorkoutStarted ? "workout-info-animated--hidden" : "workout-info-animated--visible"
          }`}
      >
        {pageProps.infoBlock}
      </div>

      <div
        className={`workout-timer ${isWorkoutStarted ? "workout-timer--visible" : "workout-timer--hidden"
          }`}
        role="timer"
        aria-live="off"
      >
        <span className="workout-timer__time">{formatTime(elapsedSeconds)}</span>
      </div>

      <div className="workout-detail-page__exercises">{pageProps.exerciseList}</div>

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

      <div
        className={`workout-active-controls ${isWorkoutStarted
          ? "workout-active-controls--visible"
          : "workout-active-controls--hidden"
          }`}
      >
        <div className="workout-controls">
          <IconButton
            icon={isPaused ? <PlayIcon /> : <PauseIcon />}
            label={isPaused ? "Продолжить" : "Пауза"}
            onClick={handlePauseResume}
            ariaLabel={isPaused ? "Продолжить тренировку" : "Поставить на паузу"}
          />
          {isStartedExercise ? (
            <ButtonLink
              type={ButtonLinkTypes.Button}
              icon={<IoIosTimer />}
              description="Завершить упражнение"
              variant="default"
              onClickHandler={openExerciseCompleteModal}
            />
          ) : (
            <ButtonLink
              type={ButtonLinkTypes.Button}
              icon={<FaHourglassStart />}
              description="Начать упражнение"
              variant="default"
              onClickHandler={handleStartExercise}
            />
          )}
          <ButtonLink
            type={ButtonLinkTypes.Button}
            icon={<BsCardChecklist />}
            description="Завершить тренировку"
            variant="default"
            onClickHandler={handleFinishWorkout}
          />
        </div>
      </div>

      <WorkoutCompleteModal
        isOpen={isCompleteModalOpen}
        onClose={handleCompleteWorkoutAndClose}
        onContinue={handleContinueWorkout}
        elapsedTime={finalElapsedTime}
        estimatedCalories={finalTotalCalories}
        isCompleteWorkout={pageProps.exercisesCount === completedExercisesCount}
        caloriesSummaryLabel={
          calorieSummaryFromExercises
            ? "Суммарно за выполненные упражнения потрачено примерно"
            : "За активное время сессии потрачено примерно"
        }
      />
      <WorkoutExercisesCountModal
        isOpen={isCompleteExerciseOpen}
        onFinishExercise={finishExercise}
        onClose={() => setIsCompleteExerciseOpen(false)}
        allSetsCount={plannedSetsForCurrentExercise}
        exerciseDurationSeconds={exerciseModalDurationSec}
        calorieUser={pageProps.calorieUser ?? null}
        strengthMet={strengthMet}
        kcalPerMinuteFallback={estimatedCaloriesPerMinute}
      />
    </>
  );
};

export default WorkoutPageContent;
