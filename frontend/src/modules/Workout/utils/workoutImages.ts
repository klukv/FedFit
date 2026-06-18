import type { StaticImageData } from "next/image";

import warmupImg from "@/assets/workout/warmup.jpg";
import cardioImg from "@/assets/workout/cardio.jpg";
import hiitImg from "@/assets/workout/hiit.jpg";
import strengthFullImg from "@/assets/workout/strength-full.jpg";
import strengthUpperImg from "@/assets/workout/strength-upper.jpg";
import strengthLegsImg from "@/assets/workout/strength-legs.jpg";
import strengthBarbellImg from "@/assets/workout/strength-barbell.jpg";
import coreImg from "@/assets/workout/core.jpg";
import bodyweightImg from "@/assets/workout/bodyweight.jpg";
import kettlebellImg from "@/assets/workout/kettlebell.jpg";
import recoveryImg from "@/assets/workout/recovery.jpg";
import enduranceImg from "@/assets/workout/endurance.jpg";

/** Категории обобщённых изображений тренировок */
export enum WorkoutImageCategory {
  WARMUP = "warmup",
  CARDIO = "cardio",
  HIIT = "hiit",
  STRENGTH_FULL = "strength-full",
  STRENGTH_UPPER = "strength-upper",
  STRENGTH_LEGS = "strength-legs",
  STRENGTH_BARBELL = "strength-barbell",
  CORE = "core",
  BODYWEIGHT = "bodyweight",
  KETTLEBELL = "kettlebell",
  RECOVERY = "recovery",
  ENDURANCE = "endurance",
}

const WORKOUT_IMAGES: Record<WorkoutImageCategory, StaticImageData> = {
  [WorkoutImageCategory.WARMUP]: warmupImg,
  [WorkoutImageCategory.CARDIO]: cardioImg,
  [WorkoutImageCategory.HIIT]: hiitImg,
  [WorkoutImageCategory.STRENGTH_FULL]: strengthFullImg,
  [WorkoutImageCategory.STRENGTH_UPPER]: strengthUpperImg,
  [WorkoutImageCategory.STRENGTH_LEGS]: strengthLegsImg,
  [WorkoutImageCategory.STRENGTH_BARBELL]: strengthBarbellImg,
  [WorkoutImageCategory.CORE]: coreImg,
  [WorkoutImageCategory.BODYWEIGHT]: bodyweightImg,
  [WorkoutImageCategory.KETTLEBELL]: kettlebellImg,
  [WorkoutImageCategory.RECOVERY]: recoveryImg,
  [WorkoutImageCategory.ENDURANCE]: enduranceImg,
};

const ALL_CATEGORIES = Object.values(WorkoutImageCategory);

/** Соответствие slug тренировки из БД → категория изображения */
const WORKOUT_VALUE_TO_CATEGORY: Record<string, WorkoutImageCategory> = {
  "morning-warmup": WorkoutImageCategory.WARMUP,
  "warmup-10": WorkoutImageCategory.WARMUP,
  "office-quick": WorkoutImageCategory.WARMUP,

  "cardio-15": WorkoutImageCategory.CARDIO,
  "cardio-45": WorkoutImageCategory.CARDIO,
  "cardio-core": WorkoutImageCategory.CARDIO,

  "hiit": WorkoutImageCategory.HIIT,
  "hiit-beginner": WorkoutImageCategory.HIIT,
  "hiit-advanced": WorkoutImageCategory.HIIT,
  "weight-loss-tabata": WorkoutImageCategory.HIIT,

  "full-body-strength": WorkoutImageCategory.STRENGTH_FULL,
  "mixed-60": WorkoutImageCategory.STRENGTH_FULL,

  "upper-dumbbells": WorkoutImageCategory.STRENGTH_UPPER,
  "upper-barbell": WorkoutImageCategory.STRENGTH_UPPER,
  "back-biceps": WorkoutImageCategory.STRENGTH_UPPER,
  "chest-triceps": WorkoutImageCategory.STRENGTH_UPPER,
  "pullup-only": WorkoutImageCategory.STRENGTH_UPPER,
  "mass-upper": WorkoutImageCategory.STRENGTH_UPPER,
  "shoulders-core": WorkoutImageCategory.STRENGTH_UPPER,

  "legs-glutes": WorkoutImageCategory.STRENGTH_LEGS,
  "legs-barbell": WorkoutImageCategory.STRENGTH_LEGS,
  "glutes-legs-focus": WorkoutImageCategory.STRENGTH_LEGS,
  "mass-legs": WorkoutImageCategory.STRENGTH_LEGS,

  "strength-advanced": WorkoutImageCategory.STRENGTH_BARBELL,

  "core-stability": WorkoutImageCategory.CORE,
  "core-short": WorkoutImageCategory.CORE,

  "full-body-none": WorkoutImageCategory.BODYWEIGHT,

  "full-body-kettlebell": WorkoutImageCategory.KETTLEBELL,

  "recovery-light": WorkoutImageCategory.RECOVERY,

  "endurance-long": WorkoutImageCategory.ENDURANCE,
};

type WorkoutImageInput = {
  id: number;
  name: string;
  value?: string;
};

function resolveCategoryByName(name: string): WorkoutImageCategory | null {
  const normalized = name.toLowerCase();

  if (/растяж|восстанов|мобильн|йога/.test(normalized)) {
    return WorkoutImageCategory.RECOVERY;
  }
  if (/разминк|зарядк|офисн/.test(normalized)) {
    return WorkoutImageCategory.WARMUP;
  }
  if (/табата|интервал|hiit/.test(normalized)) {
    return WorkoutImageCategory.HIIT;
  }
  if (/вынослив|длинн.*кардио|бег/.test(normalized)) {
    return WorkoutImageCategory.ENDURANCE;
  }
  if (/кардио/.test(normalized)) {
    return WorkoutImageCategory.CARDIO;
  }
  if (/пресс|кор\b|стабильн/.test(normalized)) {
    return WorkoutImageCategory.CORE;
  }
  if (/гир|kettlebell/.test(normalized)) {
    return WorkoutImageCategory.KETTLEBELL;
  }
  if (/без инвентар|собственн/.test(normalized)) {
    return WorkoutImageCategory.BODYWEIGHT;
  }
  if (/ног|ягодиц/.test(normalized)) {
    return WorkoutImageCategory.STRENGTH_LEGS;
  }
  if (/штанг|станов|продвинут.*силов/.test(normalized)) {
    return WorkoutImageCategory.STRENGTH_BARBELL;
  }
  if (/верх|груд|спин|бицеп|трицеп|плеч|подтяг|гантел|жим/.test(normalized)) {
    return WorkoutImageCategory.STRENGTH_UPPER;
  }
  if (/силов|full body|всё тело|смешанн|набор массы/.test(normalized)) {
    return WorkoutImageCategory.STRENGTH_FULL;
  }

  return null;
}

function resolveWorkoutCategory(workout: WorkoutImageInput): WorkoutImageCategory {
  if (workout.value && WORKOUT_VALUE_TO_CATEGORY[workout.value]) {
    return WORKOUT_VALUE_TO_CATEGORY[workout.value];
  }

  const byName = resolveCategoryByName(workout.name);
  if (byName) return byName;

  return ALL_CATEGORIES[workout.id % ALL_CATEGORIES.length];
}

export function getWorkoutImage(workout: WorkoutImageInput): StaticImageData {
  const category = resolveWorkoutCategory(workout);
  return WORKOUT_IMAGES[category];
}

export function getWorkoutImageSrc(workout: WorkoutImageInput): string {
  return getWorkoutImage(workout).src;
}

export function getTrainingPlanImage(plan: Pick<WorkoutImageInput, "id" | "name">): StaticImageData {
  const normalized = plan.name.toLowerCase();

  if (/растяж/.test(normalized)) return WORKOUT_IMAGES[WorkoutImageCategory.RECOVERY];
  if (/кардио/.test(normalized)) return WORKOUT_IMAGES[WorkoutImageCategory.CARDIO];
  if (/силов/.test(normalized)) return WORKOUT_IMAGES[WorkoutImageCategory.STRENGTH_FULL];

  return WORKOUT_IMAGES[ALL_CATEGORIES[plan.id % ALL_CATEGORIES.length]];
}

export function getTrainingPlanImageSrc(plan: Pick<WorkoutImageInput, "id" | "name">): string {
  return getTrainingPlanImage(plan).src;
}
