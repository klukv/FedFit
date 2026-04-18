import { z } from "zod";

/** Схема количества подходов в модалке завершения упражнения (max зависит от плана). */
export function buildExerciseSetsFormSchema(plannedSetsMax: number) {
  const max = Math.max(1, plannedSetsMax);
  return z.object({
    sets: z
      .number({ error: "Укажите число подходов" })
      .int("Введите целое число подходов")
      .min(0, "Не меньше 0 подходов")
      .max(max, `Не больше ${max} подходов`),
  });
}

export type ExerciseSetsFormValues = z.infer<
  ReturnType<typeof buildExerciseSetsFormSchema>
>;
