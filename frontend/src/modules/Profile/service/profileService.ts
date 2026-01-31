import type { UserProfileFormData } from "@/modules/Profile/types";

const MOCK_PROFILE: UserProfileFormData = {
  name: "Юлия",
  gender: "Женский",
  height: 165,
  weight: 100,
  desiredWeight: 70,
};

/** Загрузка данных профиля (при появлении API — заменить на запрос) */
export async function getProfile(): Promise<UserProfileFormData> {
  // TODO: заменить на вызов API, когда бекенд будет готов
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...MOCK_PROFILE }), 0);
  });
}

/** Сохранение данных профиля (при появлении API — заменить на запрос) */
export async function updateProfile(data: UserProfileFormData): Promise<void> {
  // TODO: заменить на вызов API (передать data), когда бекенд будет готов
  await new Promise((resolve) => setTimeout(resolve, 600));
  // Мок: данные приняты, при подключении API здесь будет вызов с data
  MOCK_PROFILE.name = data.name;
  MOCK_PROFILE.gender = data.gender;
  MOCK_PROFILE.height = data.height;
  MOCK_PROFILE.weight = data.weight;
  MOCK_PROFILE.desiredWeight = data.desiredWeight;
}
