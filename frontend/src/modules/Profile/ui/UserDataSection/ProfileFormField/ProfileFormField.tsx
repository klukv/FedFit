"use client";

import React from "react";
import { FormField } from "@/shared/ui";
import type { UserProfileFormData } from "@/modules/Profile/types";

export interface ProfileFormFieldProps {
  label: string;
  name: keyof UserProfileFormData;
  type: "text" | "number";
  register: React.ComponentProps<typeof FormField>["register"];
  error?: React.ComponentProps<typeof FormField>["error"];
  disabled?: boolean;
  min?: number;
  max?: number;
  inputRef?: React.Ref<HTMLInputElement>;
}

/** Поле формы профиля: обёртка над FormField с вариантом profile */
export function ProfileFormField(props: ProfileFormFieldProps) {
  return (
    <FormField
      variant="profile"
      label={props.label}
      name={props.name}
      type={props.type}
      register={props.register}
      error={props.error}
      disabled={props.disabled}
      min={props.min}
      max={props.max}
      inputRef={props.inputRef}
    />
  );
}
