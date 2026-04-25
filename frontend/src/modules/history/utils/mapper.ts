import {
    Exercise,
    ResolveManualFinishTotalsResult,
    WorkoutExecutionInitialState,
    WorkoutExerciseCalorieEntry
} from "@/modules/workout/types";
import { HistoryExercises, WorkoutHistory, WorkoutHistoryModel } from "../types";

type WorkoutHistoryForMapping = Omit<
    ResolveManualFinishTotalsResult,
    "exercisesSnapshot" |
    "calorieSummaryFromExercises"
> & { exercisesSnapshot: ExercisesForMapping[] }

type ExercisesForMapping = (
    WorkoutExerciseCalorieEntry &
    {
        repsDone: number,
        isCompleted: boolean
    });

export const mapToWorkoutHistoryDto = (
    initWHObj: WorkoutHistoryForMapping & Omit<WorkoutHistoryModel, "totalCalories">
): WorkoutHistory => {
    const mappedExercises = mapToWokoutHistoryExercises(initWHObj.exercisesSnapshot);

    return {
        workoutForHistory: {
            startedAt: initWHObj.startedAt,
            finishedAt: initWHObj.finishedAt,
            totalCalories: initWHObj.totalCaloriesBurned,
            totalDuration: initWHObj.totalDuration,
            isCompleted: initWHObj.isCompleted
        },
        exercises: mappedExercises
    }
}

export const mapHistoryToWorkoutExecutionInitialState = (
    historyItem: WorkoutHistory,
): WorkoutExecutionInitialState => ({
    isCompleted: true,
    elapsedSeconds: Math.max(0, historyItem.workoutForHistory.totalDuration),
    completedExercisesCount: historyItem.exercises.filter((exercise) => exercise.isCompleted).length,
    totalCaloriesBurned: Math.max(0, historyItem.workoutForHistory.totalCalories),
    exerciseLog: historyItem.exercises
        .filter((exercise): exercise is typeof exercise & { id: number } => typeof exercise.id === "number")
        .map((exercise, index) => ({
            id: exercise.id,
            exerciseIndex: index,
            durationSeconds: Math.max(0, exercise.durationDone),
            setsCompleted: Math.max(0, exercise.setsDone),
            caloriesBurned: Math.max(0, exercise.caloriesBurned),
        })),
});

const mapToWokoutHistoryExercises = (initWHEObj: ExercisesForMapping[]): HistoryExercises[] => {
    return initWHEObj.map((exercise) => ({
        id: exercise.id,
        setsDone: exercise.setsCompleted,
        repsDone: exercise.repsDone,
        durationDone: exercise.durationSeconds,
        caloriesBurned: exercise.caloriesBurned,
        isCompleted: exercise.isCompleted
    }))
}

export const createExercisesByIdMap = (exercises: WorkoutExerciseCalorieEntry[]) => {
    const exercisesByIdMap = new Map<number, WorkoutExerciseCalorieEntry>();

    exercises.forEach((exercise) => exercisesByIdMap.set(exercise.id, exercise));
    return exercisesByIdMap;
}

/**
 *  Склеивание информации из объектов exercises и exercisesSnapshot для маппера добавления тренировки в историю
 *  */ 
export const mapExercisesToSnapshotForDto = (exercises: Exercise[], exercisesSnapshot: WorkoutExerciseCalorieEntry[]) => {
    const completedExercisesByIdMap = createExercisesByIdMap(exercisesSnapshot);
    return exercises.map((exercise) => {
        const exerciseInMap = completedExercisesByIdMap.get(exercise.id);

        return {
            id: exercise.id,
            exerciseIndex: exerciseInMap?.exerciseIndex ?? 0,
            durationSeconds: exerciseInMap?.durationSeconds ?? 0,
            setsCompleted: exerciseInMap?.setsCompleted ?? 0,
            repsDone: exerciseInMap ? exercise.reps : 0,
            caloriesBurned: exerciseInMap?.caloriesBurned ?? 0,
            isCompleted: exerciseInMap?.setsCompleted === exercise.sets
        }
    })
}