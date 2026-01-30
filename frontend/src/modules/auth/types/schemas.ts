import { z } from "zod";

/** Минимальная длина пароля */
const MIN_PASSWORD_LENGTH = 6;

/** Схема формы входа */
export const loginFormSchema = z.object({
  username: z.string().min(1, "Введите имя пользователя"),
  password: z.string().min(MIN_PASSWORD_LENGTH, `Пароль не менее ${MIN_PASSWORD_LENGTH} символов`),
});

/**
 * Схема формы регистрации.
 * refine — валидация по нескольким полям сразу: проверяет, что password и confirmPassword
 * совпадают. Без refine пришлось бы дублировать проверку вручную в форме.
 * path: ["confirmPassword"] — к какому полю привязать сообщение об ошибке в UI.
 */
export const registerFormSchema = z
  .object({
    username: z.string().min(2, "Имя пользователя не менее 2 символов"),
    password: z.string().min(MIN_PASSWORD_LENGTH, `Пароль не менее ${MIN_PASSWORD_LENGTH} символов`),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
