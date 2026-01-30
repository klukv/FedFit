"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ButtonLink } from "@/shared/ui";
import { ROUTES } from "@/shared/constants";
import { ButtonLinkTypes } from "@/shared/types";
import { AuthFormField } from "../AuthFormField";
import { registerFormSchema, type RegisterFormValues } from "../../types";
import { register as registerService } from "../../service";
import { getErrorMessage } from "../../utils";
import "../auth-form.css";
import "./registerForm.css";

export interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { username: "", password: "", confirmPassword: "" },
  });

  React.useEffect(() => {
    const firstErrorKey = (Object.keys(errors) as (keyof RegisterFormValues)[])[0];
    if (firstErrorKey) setFocus(firstErrorKey);
  }, [errors, setFocus]);

  const onSubmit = async (data: RegisterFormValues) => {
    setSubmitError(null);
    try {
      await registerService({ username: data.username, password: data.password });
      onSuccess?.();
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Ошибка регистрации"));
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="auth-form"
      noValidate
      aria-labelledby="auth-layout-title"
    >
      <AuthFormField
        label="Имя пользователя"
        placeholder="Введите имя пользователя"
        register={register("username")}
        error={errors.username}
        autoComplete="username"
      />
      <AuthFormField
        label="Пароль"
        type="password"
        placeholder="Введите пароль"
        register={register("password")}
        error={errors.password}
        autoComplete="new-password"
      />
      <AuthFormField
        label="Подтвердите пароль"
        type="password"
        placeholder="Повторите пароль"
        register={register("confirmPassword")}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />
      {submitError && (
        <p className="auth-form__error" role="alert">
          {submitError}
        </p>
      )}
      <div className="auth-form__actions">
        <ButtonLink
          type={ButtonLinkTypes.Button}
          title="Зарегистрироваться"
          variant="default"
          buttonType="submit"
          onClickHandler={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </div>
      <p className="auth-form__footer">
        Уже есть аккаунт?{" "}
        <Link href={ROUTES.login} className="auth-form__link">
          Войти
        </Link>
      </p>
    </form>
  );
}
