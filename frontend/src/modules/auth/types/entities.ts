/** Данные для входа (запрос к API) */
export interface LoginCredentials {
  username: string;
  password: string;
}

/** Данные для регистрации (запрос к API) */
export interface RegisterCredentials {
  username: string;
  password: string;
}

/** Ответ авторизации (заглушка под будущий API) */
export interface AuthResponse {
  token?: string;
  user?: { id: string; username: string };
}
