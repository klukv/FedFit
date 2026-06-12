import type { TrainingPlan } from "@/modules/workout/types";

/** Временный флаг: предпросмотр на моках до стабильного API рекомендаций. */
export const USE_MOCK_TRAINING_PLAN = true;

const MOCK_DELAY_MS = 1200;

/** Демо-план для предпросмотра после опросника. */
export const MOCK_GENERATED_TRAINING_PLAN: TrainingPlan = {
  id: 0,
  name: "Силовой план на выносливость",
  description:
    "Сбалансированная программа с акцентом на всё тело. Тренировки чередуют нагрузку на верх и низ, чтобы вы успевали восстанавливаться между занятиями.",
  workouts: [
    { id: 1, name: "Верх тела и кор", value: "45 мин · Средний" },
    { id: 2, name: "Низ тела", value: "40 мин · Средний" },
    { id: 3, name: "Функциональный микс", value: "35 мин · Средний" },
    { id: 4, name: "Кардио + сила", value: "50 мин · Средний" },
  ],
};

export function delayMockPlan(): Promise<TrainingPlan> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({
        ...MOCK_GENERATED_TRAINING_PLAN,
        workouts: MOCK_GENERATED_TRAINING_PLAN.workouts.map((workout) => ({
          ...workout,
        })),
      });
    }, MOCK_DELAY_MS);
  });
}
