"use client";

import React, { useId, useCallback } from "react";
import { clsx } from "clsx";
import type { FormFieldProps } from "./types";
import "./formField.css";

/**
 * Общее поле формы с вариантами оформления (auth / profile).
 * Переиспользуется в формах авторизации и редактирования профиля.
 */
export function FormField(props: FormFieldProps) {
  const uniqueId = useId();
  const id = `form-field-${props.name}-${uniqueId.replace(/:/g, "")}`;
  const errorId = `${id}-error`;
  const isNumber = props.type === "number";

  const { ref: registerRef, ...registerRest } = props.register;
  const inputRef = props.inputRef;

  const mergedRef = useCallback(
    (el: HTMLInputElement | null) => {
      registerRef(el);
      if (inputRef) {
        if (typeof inputRef === "function") {
          inputRef(el);
        } else {
          (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
        }
      }
    },
    [registerRef, inputRef]
  );

  return (
    <div
      className={clsx("form-field", `form-field--${props.variant}`)}
      data-variant={props.variant}
    >
      <label htmlFor={id} className="form-field__label">
        {props.label}
      </label>
      <input
        id={id}
        ref={mergedRef}
        type={props.type ?? "text"}
        className={clsx("form-field__input", {
          "form-field__input--error": Boolean(props.error),
        })}
        disabled={props.disabled ?? false}
        placeholder={props.placeholder}
        autoComplete={props.autoComplete}
        aria-invalid={Boolean(props.error)}
        aria-describedby={props.error ? errorId : undefined}
        min={isNumber ? props.min : undefined}
        max={isNumber ? props.max : undefined}
        {...registerRest}
      />
      {props.error?.message && (
        <span id={errorId} className="form-field__error" role="alert">
          {props.error.message}
        </span>
      )}
    </div>
  );
}
