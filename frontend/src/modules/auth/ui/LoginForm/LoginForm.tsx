"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ButtonLink } from "@/shared/ui";
import { ROUTES } from "@/shared/constants";
import { ButtonLinkTypes } from "@/shared/types";
import { AuthFormField } from "../AuthFormField";
import { loginFormSchema, type LoginFormValues } from "../../types";
import { login } from "../../service";
import { getErrorMessage } from "../../utils";
import "../auth-form.css";
import "./loginForm.css";

export interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: "", password: "" },
  });

  React.useEffect(() => {
    const firstErrorKey = (Object.keys(errors) as (keyof LoginFormValues)[])[0];
    if (firstErrorKey) setFocus(firstErrorKey);
  }, [errors, setFocus]);

  const onSubmit = async (data: LoginFormValues) => {
    setSubmitError(null);
    try {
      await login(data);
      onSuccess?.();
    } catch (err) {
      setSubmitError(getErrorMessage(err, "Ошибка входа"));
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
        autoComplete="current-password"
      />
      {submitError && (
        <p className="auth-form__error" role="alert">
          {submitError}
        </p>
      )}
      <div className="auth-form__actions">
        <ButtonLink
          type={ButtonLinkTypes.Button}
          title="Войти"
          variant="default"
          buttonType="submit"
          onClickHandler={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </div>
      <p className="auth-form__footer">
        Нет аккаунта?{" "}
        <Link href={ROUTES.register} className="auth-form__link">
          Зарегистрироваться
        </Link>
      </p>
    </form>
  );
}
