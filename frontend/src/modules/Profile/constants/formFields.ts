import type { UserProfileFormData } from "@/modules/Profile/types";
import { PROFILE_VALIDATION } from "./validation";

const V = PROFILE_VALIDATION;

export type ProfileFieldConfig = {
  label: string;
  name: keyof UserProfileFormData;
  type: "text" | "number";
  min?: number;
  max?: number;
  valueAsNumber?: boolean;
};

/** Конфигурация полей формы профиля (единый источник правды для рендера полей) */
export const PROFILE_FIELDS_CONFIG: ReadonlyArray<ProfileFieldConfig> = [
  { label: "Имя", name: "name", type: "text" },
  { label: "Пол", name: "gender", type: "text" },
  {
    label: "Рост",
    name: "height",
    type: "number",
    min: V.height.min,
    max: V.height.max,
    valueAsNumber: true,
  },
  {
    label: "Вес",
    name: "weight",
    type: "number",
    min: V.weight.min,
    max: V.weight.max,
    valueAsNumber: true,
  },
  {
    label: "Желаемый вес",
    name: "desiredWeight",
    type: "number",
    min: V.desiredWeight.min,
    max: V.desiredWeight.max,
    valueAsNumber: true,
  },
];
