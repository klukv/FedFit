import { StaticImageProps } from "@/shared/types";
import type { Exercise, WorkoutDetail } from "./entities";
import type {
  WorkoutCalorieUser,
  WorkoutCaloriesSessionResult,
  WorkoutExerciseCalorieEntry,
} from "./calories";

export enum WorkoutItemVariants {
  SMALL = "SMALL",
  LARGE_WITH_BUTTON = "LARGE_WITH_BUTTON",
}

interface WorkoutItemBase {
  type: WorkoutItemVariants;
  title: string;
  backgroundImage: StaticImageProps;
}

interface WorkoutItemSmall extends WorkoutItemBase {
  type: WorkoutItemVariants.SMALL;
}

interface WorkoutItemLarge extends WorkoutItemBase {
  type: WorkoutItemVariants.LARGE_WITH_BUTTON;
  buttonLink: {
    href: string;
    title: string;
  };
}

export type WorkoutItemProps = WorkoutItemSmall | WorkoutItemLarge;

export interface UseWorkoutExecutionControllerParams {
  workoutId: number;
  exercisesCount: number;
  exercises: Exercise[];
  calorieUser?: WorkoutCalorieUser | null;
  workoutLevel?: WorkoutDetail["level"];
  plannedSetsFallback?: number;
  estimatedCaloriesPerMinute?: number;
  onWorkoutCaloriesComputed?: (payload: WorkoutCaloriesSessionResult) => void;
  initialExecutionState?: WorkoutExecutionInitialState;
}

export interface WorkoutExecutionInitialState {
  fromHistory: boolean;
  elapsedSeconds: number;
  completedExercisesCount: number;
  totalCaloriesBurned: number;
  exerciseLog: WorkoutExerciseCalorieEntry[];
}
