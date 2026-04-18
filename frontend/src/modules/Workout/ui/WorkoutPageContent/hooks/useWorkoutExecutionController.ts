"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  workoutCaloriesService,
  workoutExerciseSegmentService,
  workoutSessionFinishService,
} from "../../../service";
import type { Exercise, WorkoutDetail } from "../../../types";
import type {
  WorkoutCalorieUser,
  WorkoutCaloriesSessionResult,
  WorkoutExerciseCalorieEntry,
} from "../../../types/calories";

export interface UseWorkoutExecutionControllerParams {
  workoutId: number;
  exercisesCount: number;
  exercises?: Exercise[];
  calorieUser?: WorkoutCalorieUser | null;
  workoutLevel?: WorkoutDetail["level"];
  plannedSetsFallback?: number;
  estimatedCaloriesPerMinute?: number;
  onWorkoutCaloriesComputed?: (payload: WorkoutCaloriesSessionResult) => void;
}

export function useWorkoutExecutionController(
  params: UseWorkoutExecutionControllerParams,
) {
  const {
    workoutId,
    exercisesCount,
    exercises,
    calorieUser: calorieUserProp,
    workoutLevel,
    plannedSetsFallback: plannedSetsFallbackProp,
    estimatedCaloriesPerMinute: estimatedKcalProp,
    onWorkoutCaloriesComputed,
  } = params;

  const plannedSetsFallback = plannedSetsFallbackProp ?? 5;
  const estimatedCaloriesPerMinute = estimatedKcalProp ?? 13;
  const calorieUser = calorieUserProp ?? null;

  const strengthMet = useMemo(
    () => workoutCaloriesService.resolveStrengthMetByLevel(workoutLevel),
    [workoutLevel],
  );

  /* ---------- Таймер и пауза (уровень тренировки) ---------- */
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ---------- Упражнения: прогресс и журнал сегментов ---------- */
  const [completedExercisesCount, setCompletedExercisesCount] = useState(0);
  const [isStartedExercise, setIsStartedExercise] = useState(false);
  const exerciseSegmentStartRef = useRef(0);
  const elapsedAtSegmentEndRef = useRef(0);
  const exerciseCalorieLogRef = useRef<WorkoutExerciseCalorieEntry[]>([]);

  const [isCompleteExerciseOpen, setIsCompleteExerciseOpen] = useState(false);
  const [exerciseModalDurationSec, setExerciseModalDurationSec] = useState(0);

  /* ---------- Модалка завершения тренировки ---------- */
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [finalElapsedTime, setFinalElapsedTime] = useState(0);
  const [finalTotalCalories, setFinalTotalCalories] = useState(0);
  const [calorieSummaryFromExercises, setCalorieSummaryFromExercises] =
    useState(false);

  const plannedSetsForCurrentExercise = useMemo(
    () =>
      workoutExerciseSegmentService.resolvePlannedSets(
        exercises,
        completedExercisesCount,
        plannedSetsFallback,
      ),
    [exercises, completedExercisesCount, plannedSetsFallback],
  );

  const emitSessionPayload = useCallback(
    (
      totalDuration: number,
      overrides?: {
        totalCaloriesBurned?: number;
        exercises?: WorkoutExerciseCalorieEntry[];
      },
    ) => {
      const exercisesPayload =
        overrides?.exercises ?? [...exerciseCalorieLogRef.current];
      const totalCaloriesBurned =
        overrides?.totalCaloriesBurned ??
        workoutCaloriesService.sumExerciseCaloriesBurned(exercisesPayload);
      onWorkoutCaloriesComputed?.({
        workoutId,
        totalDurationSeconds: totalDuration,
        totalCaloriesBurned,
        exercises: exercisesPayload,
      });
    },
    [workoutId, onWorkoutCaloriesComputed],
  );

  const resetExerciseTracking = useCallback(() => {
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

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleStartWorkout = useCallback(() => {
    resetExerciseTracking();
    setIsWorkoutStarted(true);
    setIsStartedExercise(true);
    setIsPaused(false);
    setElapsedSeconds(0);
    exerciseSegmentStartRef.current = 0;
  }, [resetExerciseTracking]);

  const handleStartExercise = useCallback(() => {
    setIsStartedExercise(true);
    setIsPaused(false);
    exerciseSegmentStartRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  const handleFinishWorkout = useCallback(() => {
    setFinalElapsedTime(elapsedSeconds);
    const { totalCaloriesBurned, calorieSummaryFromExercises, exercisesSnapshot } =
      workoutSessionFinishService.resolveManualFinishTotals({
        exerciseLog: exerciseCalorieLogRef.current,
        elapsedSeconds,
        calorieUser,
        strengthMet,
        estimatedCaloriesPerMinute,
      });
    setCalorieSummaryFromExercises(calorieSummaryFromExercises);
    setFinalTotalCalories(totalCaloriesBurned);
    emitSessionPayload(elapsedSeconds, {
      totalCaloriesBurned,
      exercises: exercisesSnapshot,
    });
    setIsCompleteModalOpen(true);
    setIsPaused(true);
  }, [
    calorieUser,
    elapsedSeconds,
    emitSessionPayload,
    estimatedCaloriesPerMinute,
    strengthMet,
  ]);

  const handleCompleteWorkoutAndClose = useCallback(() => {
    setIsCompleteModalOpen(false);
    setIsWorkoutStarted(false);
    setIsPaused(false);
    setElapsedSeconds(0);
    resetExerciseTracking();
    setCompletedExercisesCount(0);
    setIsStartedExercise(false);
    setCalorieSummaryFromExercises(false);
  }, [resetExerciseTracking]);

  const finishExercise = useCallback(
    (completedSets: number) => {
      const durationSec = workoutExerciseSegmentService.computeSegmentDuration(
        elapsedAtSegmentEndRef.current,
        exerciseSegmentStartRef.current,
      );

      const entry = workoutExerciseSegmentService.buildCalorieEntry({
        exerciseIndex: completedExercisesCount,
        durationSeconds: durationSec,
        setsCompleted: completedSets,
        calorieUser,
        strengthMet,
        plannedSets: plannedSetsForCurrentExercise,
        kcalPerMinuteFallback: estimatedCaloriesPerMinute,
      });
      exerciseCalorieLogRef.current = [...exerciseCalorieLogRef.current, entry];

      const nextCompleted = completedExercisesCount + 1;
      setCompletedExercisesCount(nextCompleted);

      if (nextCompleted === exercisesCount) {
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
        togglePause();
      }

      setIsStartedExercise(false);
    },
    [
      calorieUser,
      completedExercisesCount,
      elapsedSeconds,
      emitSessionPayload,
      estimatedCaloriesPerMinute,
      exercisesCount,
      plannedSetsForCurrentExercise,
      strengthMet,
      togglePause,
    ],
  );

  const handleContinueWorkout = useCallback(() => {
    setIsCompleteModalOpen(false);
    setIsPaused(false);
  }, []);

  const openExerciseCompleteModal = useCallback(() => {
    const end = elapsedSeconds;
    elapsedAtSegmentEndRef.current = end;
    setExerciseModalDurationSec(
      workoutExerciseSegmentService.computeSegmentDuration(
        end,
        exerciseSegmentStartRef.current,
      ),
    );
    setIsCompleteExerciseOpen(true);
  }, [elapsedSeconds]);

  return {
    strengthMet,
    plannedSetsForCurrentExercise,
    isWorkoutStarted,
    isPaused,
    elapsedSeconds,
    completedExercisesCount,
    isStartedExercise,
    isCompleteModalOpen,
    isCompleteExerciseOpen,
    setIsCompleteExerciseOpen,
    finalElapsedTime,
    finalTotalCalories,
    calorieSummaryFromExercises,
    exerciseModalDurationSec,
    handleStartWorkout,
    togglePause,
    handleStartExercise,
    handleFinishWorkout,
    handleCompleteWorkoutAndClose,
    handleContinueWorkout,
    openExerciseCompleteModal,
    finishExercise,
  };
}
