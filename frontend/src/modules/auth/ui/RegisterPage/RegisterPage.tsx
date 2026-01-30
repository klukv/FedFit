"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { AuthLayout } from "../AuthLayout";
import { RegisterForm } from "../RegisterForm";

/** Страница регистрации */
export function RegisterPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(ROUTES.home);
    router.refresh();
  };

  return (
    <AuthLayout title="Регистрация">
      <RegisterForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
