"use client";

import React from "react";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { clsx } from "clsx";
import "./authFormField.css";

export interface AuthFormFieldProps {
  label: string;
  type?: "text" | "password" | "email";
  placeholder?: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  autoComplete?: string;
  disabled?: boolean;
}

/** Поле формы авторизации с лейблом и отображением ошибки */
export function AuthFormField(props: AuthFormFieldProps) {
  const uniqueId = React.useId();
  const id = `auth-field-${props.register.name}-${uniqueId.replace(/:/g, "")}`;

  return (
    <div className="auth-form-field">
      <label htmlFor={id} className="auth-form-field__label">
        {props.label}
      </label>
      <input
        id={id}
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        disabled={props.disabled ?? false}
        className={clsx("auth-form-field__input", {
          "auth-form-field__input--error": Boolean(props.error),
        })}
        aria-invalid={Boolean(props.error)}
        aria-describedby={props.error ? `${id}-error` : undefined}
        {...props.register}
      />
      {props.error?.message && (
        <span id={`${id}-error`} className="auth-form-field__error" role="alert">
          {props.error.message}
        </span>
      )}
    </div>
  );
}
