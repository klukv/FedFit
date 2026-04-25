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
import type {
  WorkoutExerciseCalorieEntry,
} from "../../../types/calories";
import type { UseWorkoutExecutionControllerParams } from "../../../types";
import { formatDate } from "@/shared/utils";
import { historyService } from "@/modules/history";
import { mapExercisesToSnapshotForDto, mapToWorkoutHistoryDto } from "@/modules/history/utils";

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
    initialExecutionState,
    source = "plan",
    workoutHistoryId,
  } = params;
  const plannedSetsFallback = plannedSetsFallbackProp ?? 5;
  const estimatedCaloriesPerMinute = estimatedKcalProp ?? 13;
  const calorieUser = calorieUserProp ?? null;
  const restoredState = useMemo(
    () => {
      if (!initialExecutionState || initialExecutionState.isCompleted) return null;
      return {
        ...initialExecutionState,
        elapsedSeconds: Math.max(0, initialExecutionState.elapsedSeconds),
        completedExercisesCount: Math.min(
          Math.max(0, initialExecutionState.completedExercisesCount),
          exercisesCount,
        ),
        totalCaloriesBurned: Math.max(0, initialExecutionState.totalCaloriesBurned),
      };
    },
    [initialExecutionState, exercisesCount],
  );
  const isRestoredFromHistory = Boolean(restoredState);
  const activeWorkoutHistoryId = workoutHistoryId ?? initialExecutionState?.workoutHistoryId;

  const strengthMet = useMemo(
    () => workoutCaloriesService.resolveStrengthMetByLevel(workoutLevel),
    [workoutLevel],
  );

  const [isWorkoutStarted, setIsWorkoutStarted] = useState(isRestoredFromHistory);
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(
    restoredState ? new Date(Date.now() - restoredState.elapsedSeconds * 1000) : null,
  );
  const [isPaused, setIsPaused] = useState(isRestoredFromHistory);
  const [elapsedSeconds, setElapsedSeconds] = useState(
    restoredState?.elapsedSeconds ?? 0,
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [completedExercisesCount, setCompletedExercisesCount] = useState(
    restoredState?.completedExercisesCount ?? 0,
  );
  const [isStartedExercise, setIsStartedExercise] = useState(false);
  const exerciseSegmentStartRef = useRef(0);
  const elapsedAtSegmentEndRef = useRef(0);
  const exerciseCalorieLogRef = useRef<WorkoutExerciseCalorieEntry[]>(
    restoredState?.exerciseLog ?? [],
  );

  const [isCompleteExerciseOpen, setIsCompleteExerciseOpen] = useState(false);
  const [exerciseModalDurationSec, setExerciseModalDurationSec] = useState(0);

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [finalElapsedTime, setFinalElapsedTime] = useState(0);
  const [finalTotalCalories, setFinalTotalCalories] = useState(
    restoredState?.totalCaloriesBurned ?? 0,
  );
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
    setWorkoutStartTime(new Date());
    exerciseSegmentStartRef.current = 0;
  }, [resetExerciseTracking]);

  const handleStartExercise = useCallback(() => {
    setIsStartedExercise(true);
    setIsPaused(false);
    exerciseSegmentStartRef.current = elapsedSeconds;
  }, [elapsedSeconds]);

  const persistWorkoutHistory = useCallback(
    async (
      payload: Parameters<typeof mapToWorkoutHistoryDto>[0],
    ) => { 
      const historyDto = mapToWorkoutHistoryDto(payload);

      if (activeWorkoutHistoryId) {
        await historyService.updateWorkoutInHistory(activeWorkoutHistoryId, historyDto);
        return;
      }

      // TODO: Временное ветвление до внедрения Redux-контекста источника перехода.
      // Для source=history ожидаем workoutHistoryId в query, иначе пока создаём новую запись.
      if (source === "history" && !activeWorkoutHistoryId) {
        await historyService.addWorkoutToHistory(workoutId, 1, historyDto);
        return;
      }

      await historyService.addWorkoutToHistory(workoutId, 1, historyDto);
    },
    [activeWorkoutHistoryId, source, workoutId],
  );

  const handleFinishWorkout = useCallback(async () => {
    let workoutEndTime: Date | null = null;
    setFinalElapsedTime(elapsedSeconds);

    // TODO Попап ошибки (toast)
    if (!workoutStartTime) {
      console.error("Не передано начальное время");
      return
    }
    workoutEndTime = new Date(workoutStartTime.getTime() + elapsedSeconds * 1000);

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

    // TODO Попап ошибки (toast)
    if (!workoutEndTime) {
      console.log("Не передано конечное время\n", workoutEndTime);
      return;
    };

    await persistWorkoutHistory({
      startedAt: formatDate(workoutStartTime),
      finishedAt: formatDate(workoutEndTime),
      totalDuration: elapsedSeconds,
      isCompleted: false,
      totalCaloriesBurned,
      exercisesSnapshot: mapExercisesToSnapshotForDto(exercises, exercisesSnapshot)
    });

    setIsCompleteModalOpen(true);
    setIsPaused(true);
  }, [
    calorieUser,
    elapsedSeconds,
    emitSessionPayload,
    estimatedCaloriesPerMinute,
    exercises,
    persistWorkoutHistory,
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
    async (completedSets: number) => {
      const completedExercise = exercises?.[completedExercisesCount];
      if (!completedExercise) return;

      const durationSec = workoutExerciseSegmentService.computeSegmentDuration(
        elapsedAtSegmentEndRef.current,
        exerciseSegmentStartRef.current,
      );

      const entry = workoutExerciseSegmentService.buildCalorieEntry({
        exerciseId: completedExercise.id,
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
        let workoutEndTime: Date | null = null;
        setFinalElapsedTime(elapsedSeconds);

        // TODO Попап ошибки (toast)
        if (!workoutStartTime) {
          console.error("Не передано начальное время");
          return
        }
        workoutEndTime = new Date(workoutStartTime.getTime() + elapsedSeconds * 1000);

        setCalorieSummaryFromExercises(true);
        const total = workoutCaloriesService.sumExerciseCaloriesBurned(
          exerciseCalorieLogRef.current,
        );
        setFinalTotalCalories(total);
        emitSessionPayload(elapsedSeconds);
        setIsCompleteModalOpen(true);
        setIsPaused(true);

        await persistWorkoutHistory({
          startedAt: formatDate(workoutStartTime),
          finishedAt: formatDate(workoutEndTime),
          totalDuration: elapsedSeconds,
          isCompleted: true,
          totalCaloriesBurned: total,
          exercisesSnapshot: mapExercisesToSnapshotForDto(exercises, exerciseCalorieLogRef.current)
        })
      } else {
        togglePause();
      }

      setIsStartedExercise(false);
    },
    [
      calorieUser,
      completedExercisesCount,
      exercises,
      elapsedSeconds,
      emitSessionPayload,
      estimatedCaloriesPerMinute,
      exercisesCount,
      plannedSetsForCurrentExercise,
      persistWorkoutHistory,
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
