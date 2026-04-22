export interface WorkoutHistory {
  workoutForHistory: WorkoutHistoryModel,
  exercises: HistoryExercises[]
}

export interface WorkoutHistoryModel {
  id?: number,
  workoutId: number,
  startedAt: string,
  finishedAt: string,
  totalCalories: number
  totalDuration: number,
  isCompleted: boolean
}

export interface HistoryExercises {
  id?: number,
  setsDone: number,
  repsDone: number,
  durationDone: number,
  caloriesBurned: number,
  isCompleted: boolean
}