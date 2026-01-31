import type { UserProfileFormData } from "@/modules/Profile/types";

/** Приводит данные профиля (props/API) к виду формы */
export function toProfileFormValues(
  data: Readonly<{
    name: string;
    gender: string;
    height: number;
    weight: number;
    desiredWeight: number;
  }>
): UserProfileFormData {
  return {
    name: data.name,
    gender: data.gender,
    height: data.height,
    weight: data.weight,
    desiredWeight: data.desiredWeight,
  };
}
