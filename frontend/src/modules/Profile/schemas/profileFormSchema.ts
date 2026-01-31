import { z } from "zod";
import { PROFILE_VALIDATION } from "@/modules/Profile/constants";

const V = PROFILE_VALIDATION;

/**
 * Схема валидации формы профиля.
 * Правила подобраны так, чтобы не создавать лишних барьеров для пользователя.
 */
export const profileFormSchema = z.object({
  name: z
    .string()
    .min(V.name.minLength, "Имя должно содержать от 2 до 100 символов")
    .max(V.name.maxLength, "Имя должно содержать от 2 до 100 символов")
    .trim(),
  gender: z
    .string()
    .min(1, "Укажите пол")
    .max(V.gender.maxLength, "Не более 50 символов")
    .trim(),
  height: z
    .number({ error: "Рост должен быть числом" })
    .min(V.height.min, "Рост от 100 до 250 см")
    .max(V.height.max, "Рост от 100 до 250 см"),
  weight: z
    .number({ error: "Вес должен быть числом" })
    .min(V.weight.min, "Вес от 30 до 300 кг")
    .max(V.weight.max, "Вес от 30 до 300 кг"),
  desiredWeight: z
    .number({ error: "Желаемый вес должен быть числом" })
    .min(V.desiredWeight.min, "Желаемый вес от 30 до 300 кг")
    .max(V.desiredWeight.max, "Желаемый вес от 30 до 300 кг"),
});

export type ProfileFormSchema = z.infer<typeof profileFormSchema>;
