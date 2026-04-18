/**
 * Параметры оценки расхода за интервал (MET + опционально доля подходов).
 */
export interface EstimateWorkoutCaloriesOptions {
  met: number;
  setsDone?: number;
  plannedSets?: number;
}
