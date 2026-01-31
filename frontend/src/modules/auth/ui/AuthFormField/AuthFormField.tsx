"use client";

import React from "react";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { FormField } from "@/shared/ui";

export interface AuthFormFieldProps {
  label: string;
  type?: "text" | "password" | "email";
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  autoComplete?: string;
  disabled?: boolean;
}

/** Поле формы авторизации: обёртка над FormField с вариантом auth */
export function AuthFormField(props: AuthFormFieldProps) {
  return (
    <FormField
      variant="auth"
      label={props.label}
      name={props.register.name}
      type={props.type}
      register={props.register}
      error={props.error}
      disabled={props.disabled}
      placeholder={props.placeholder}
      autoComplete={props.autoComplete}
    />
  );
}
