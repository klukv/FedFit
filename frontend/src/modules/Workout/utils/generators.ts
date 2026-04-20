import { Exercise, WorkoutExerciseCalorieEntry } from "../types";

export const createExercisesByIdMap = (exercises: WorkoutExerciseCalorieEntry[]) => {
    const exercisesByIdMap = new Map<number, WorkoutExerciseCalorieEntry>();

    exercises.forEach((exercise) => exercisesByIdMap.set(exercise.id, exercise));
    return exercisesByIdMap;
}