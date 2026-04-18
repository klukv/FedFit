import type { UserProfileFormData } from "@/modules/profile/types";
import type { WorkoutCalorieUser, WorkoutExerciseCalorieEntry } from "../types/calories";
import type { EstimateWorkoutCaloriesOptions } from "../types/workoutCaloriesEstimate";
import type { WorkoutDetail } from "../types/entities";

const DEFAULT_AGE_YEARS = 30;

/**
 * Доменная логика оценки расхода калорий во время тренировки.
 * Не смешивать с чистым форматированием (см. utils/format).
 */
export class WorkoutCaloriesService {
  /** MET для силовой работы средней интенсивности по уровню сложности тренировки. */
  resolveStrengthMetByLevel(level: WorkoutDetail["level"] | undefined): number {
    switch (level) {
      case "Начинающий":
        return 4;
      case "Средний":
        return 5;
      case "Продвинутый":
        return 6;
      default:
        return 5;
    }
  }

  /** Эвристика по русскоязычным подписям пола в профиле. */
  isFemaleGenderLabel(gender: string): boolean {
    return gender.trim().toLowerCase().includes("жен");
  }

  /**
   * BMR по уравнению Миффлина — Сан Жеора (ккал/сутки).
   * @see https://www.ncbi.nlm.nih.gov/books/NBK279077/
   */
  estimateBmrMifflinStJeor(profile: WorkoutCalorieUser): number {
    const age = profile.ageYears ?? DEFAULT_AGE_YEARS;
    const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * age;
    return this.isFemaleGenderLabel(profile.gender) ? base - 161 : base + 5;
  }

  /**
   * Оценка килокалорий за интервал активности.
   * (BMR / 1440) × MET × минуты × (setsDone / plannedSets при наличии).
   */
  estimateWorkoutCaloriesFromProfile(
    profile: WorkoutCalorieUser,
    durationSeconds: number,
    options: EstimateWorkoutCaloriesOptions,
  ): number {
    if (
      durationSeconds <= 0 ||
      profile.weightKg <= 0 ||
      profile.heightCm <= 0
    ) {
      return 0;
    }

    const minutes = durationSeconds / 60;
    const bmr = this.estimateBmrMifflinStJeor(profile);
    const kcalPerMinuteAtActivity = (bmr / 1440) * options.met;
    let kcal = kcalPerMinuteAtActivity * minutes;

    const planned = options.plannedSets;
    const done = options.setsDone;
    if (planned && planned > 0 && done !== undefined) {
      kcal *= Math.min(1, Math.max(0, done / planned));
    }

    return Math.max(0, kcal);
  }

  roundCalories(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.round(value));
  }

  sumExerciseCaloriesBurned(
    entries: readonly Pick<WorkoutExerciseCalorieEntry, "caloriesBurned">[],
  ): number {
    return entries.reduce((acc, e) => acc + e.caloriesBurned, 0);
  }

  /** Fallback без антропометрии: ккал/мин × время (сек → мин). */
  estimateCaloriesFromDurationAndPerMinuteRate(
    durationSeconds: number,
    kcalPerMinute: number,
  ): number {
    if (durationSeconds <= 0 || kcalPerMinute <= 0) return 0;
    return Math.max(0, Math.round((durationSeconds / 60) * kcalPerMinute));
  }

  /**
   * Fallback с учётом доли подходов (согласовано с превью в модалке).
   */
  estimateFallbackWithSets(
    durationSeconds: number,
    kcalPerMinute: number,
    setsDone: number,
    plannedSets: number,
  ): number {
    const base = this.estimateCaloriesFromDurationAndPerMinuteRate(
      durationSeconds,
      kcalPerMinute,
    );
    const plannedSafe = Math.max(1, plannedSets);
    return Math.max(
      0,
      Math.round(base * Math.min(1, Math.max(0, setsDone / plannedSafe))),
    );
  }

  /**
   * Превью калорий для модалки: один вызов вместо дублирования условий UI.
   */
  estimateExerciseCaloriesPreview(input: {
    calorieUser: WorkoutCalorieUser | null;
    exerciseDurationSeconds: number;
    strengthMet: number;
    plannedSetsSafe: number;
    setsDone: number;
    kcalPerMinuteFallback: number;
  }): number {
    if (input.exerciseDurationSeconds <= 0) return 0;
    if (input.calorieUser) {
      return this.roundCalories(
        this.estimateWorkoutCaloriesFromProfile(
          input.calorieUser,
          input.exerciseDurationSeconds,
          {
            met: input.strengthMet,
            plannedSets: input.plannedSetsSafe,
            setsDone: input.setsDone,
          },
        ),
      );
    }
    return this.estimateFallbackWithSets(
      input.exerciseDurationSeconds,
      input.kcalPerMinuteFallback,
      input.setsDone,
      input.plannedSetsSafe,
    );
  }

  /**
   * Сопоставление данных профиля с моделью расчёта калорий.
   * null — если вес/рост не позволяют посчитать BMR надёжно.
   */
  mapUserProfileToWorkoutCalorieUser(
    profile: UserProfileFormData,
    ageYears: number = DEFAULT_AGE_YEARS,
  ): WorkoutCalorieUser | null {
    const weightKg = profile.weight;
    const heightCm = profile.height;
    if (weightKg <= 0 || heightCm <= 0) {
      return null;
    }

    return {
      weightKg,
      heightCm,
      gender: profile.gender,
      ageYears,
    };
  }
}

/** Синглтон без состояния — удобно в React без лишних useMemo. */
export const workoutCaloriesService = new WorkoutCaloriesService();
