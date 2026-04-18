"use client";

import { ReactNode } from "react";
import { WorkoutExercisesCountModal } from "../WorkoutExercisesCountModal";
import { WorkoutCompleteModal } from "../WorkoutCompleteModal";
import type { Exercise, WorkoutDetail } from "../../types";
import type {
  WorkoutCalorieUser,
  WorkoutCaloriesSessionResult,
} from "../../types/calories";
import { useWorkoutExecutionController } from "./hooks/useWorkoutExecutionController";
import {
  WorkoutActiveControlsBar,
  WorkoutInfoAnimatedSlot,
  WorkoutProgressSection,
  WorkoutStartPanel,
  WorkoutTimerDisplay,
} from "./components";
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

const WorkoutPageContent = (pageProps: WorkoutPageContentProps) => {
  const execution = useWorkoutExecutionController({
    workoutId: pageProps.workoutId,
    exercisesCount: pageProps.exercisesCount,
    exercises: pageProps.exercises,
    calorieUser: pageProps.calorieUser,
    workoutLevel: pageProps.workoutLevel,
    plannedSetsFallback: pageProps.plannedSetsFallback,
    estimatedCaloriesPerMinute: pageProps.estimatedCaloriesPerMinute,
    onWorkoutCaloriesComputed: pageProps.onWorkoutCaloriesComputed,
  });

  return (
    <>
      {execution.isWorkoutStarted && (
        <WorkoutProgressSection
          completedExercisesCount={execution.completedExercisesCount}
          exercisesCount={pageProps.exercisesCount}
        />
      )}

      <WorkoutInfoAnimatedSlot isHidden={execution.isWorkoutStarted}>
        {pageProps.infoBlock}
      </WorkoutInfoAnimatedSlot>

      <WorkoutTimerDisplay
        elapsedSeconds={execution.elapsedSeconds}
        isVisible={execution.isWorkoutStarted}
      />

      <div className="workout-detail-page__exercises">{pageProps.exerciseList}</div>

      <WorkoutStartPanel
        isVisible={!execution.isWorkoutStarted}
        onStart={execution.handleStartWorkout}
      />

      <WorkoutActiveControlsBar
        isVisible={execution.isWorkoutStarted}
        isPaused={execution.isPaused}
        isExerciseInProgress={execution.isStartedExercise}
        onTogglePause={execution.togglePause}
        onStartExercise={execution.handleStartExercise}
        onOpenExerciseComplete={execution.openExerciseCompleteModal}
        onFinishWorkout={execution.handleFinishWorkout}
      />

      <WorkoutCompleteModal
        isOpen={execution.isCompleteModalOpen}
        onClose={execution.handleCompleteWorkoutAndClose}
        onContinue={execution.handleContinueWorkout}
        elapsedTime={execution.finalElapsedTime}
        estimatedCalories={execution.finalTotalCalories}
        isCompleteWorkout={pageProps.exercisesCount === execution.completedExercisesCount}
        caloriesSummaryLabel={
          execution.calorieSummaryFromExercises
            ? "Суммарно за выполненные упражнения потрачено примерно"
            : "За активное время сессии потрачено примерно"
        }
      />
      <WorkoutExercisesCountModal
        isOpen={execution.isCompleteExerciseOpen}
        onFinishExercise={execution.finishExercise}
        onClose={() => execution.setIsCompleteExerciseOpen(false)}
        allSetsCount={execution.plannedSetsForCurrentExercise}
        exerciseDurationSeconds={execution.exerciseModalDurationSec}
        calorieUser={pageProps.calorieUser ?? null}
        strengthMet={execution.strengthMet}
        kcalPerMinuteFallback={pageProps.estimatedCaloriesPerMinute ?? 13}
      />
    </>
  );
};

export default WorkoutPageContent;
