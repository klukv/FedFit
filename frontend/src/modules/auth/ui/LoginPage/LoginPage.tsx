"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { AuthLayout } from "../AuthLayout";
import { LoginForm } from "../LoginForm";

/** Страница входа */
export function LoginPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push(ROUTES.home);
    router.refresh();
  };

  return (
    <AuthLayout title="Вход">
      <LoginForm onSuccess={handleSuccess} />
    </AuthLayout>
  );
}
