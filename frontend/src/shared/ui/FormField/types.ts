import type { UseFormRegisterReturn, FieldError } from "react-hook-form";

export type FormFieldVariant = "auth" | "profile";

export interface FormFieldProps {
  variant: FormFieldVariant;
  label: string;
  /** Имя поля (для id и register.name) */
  name: string;
  type?: "text" | "password" | "email" | "number";
  register: UseFormRegisterReturn;
  error?: FieldError;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
  min?: number;
  max?: number;
  /** Передать ref для фокуса (profile) */
  inputRef?: React.Ref<HTMLInputElement>;
}
