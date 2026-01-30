import type { LoginCredentials, RegisterCredentials, AuthResponse } from "../types";

/** Заглушка: вход. Заменить на вызов shared/api при появлении бекенда */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  if (credentials.username && credentials.password) {
    return { user: { id: "1", username: credentials.username } };
  }
  throw new Error("Неверное имя пользователя или пароль");
}

/** Заглушка: регистрация. Заменить на вызов shared/api при появлении бекенда */
export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return { user: { id: "1", username: credentials.username } };
}
