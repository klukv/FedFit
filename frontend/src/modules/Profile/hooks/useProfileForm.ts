"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, type ProfileFormSchema } from "@/modules/Profile/schemas";
import { updateProfile } from "@/modules/Profile/service";
import type { UserProfileFormData } from "@/modules/Profile/types";

export function useProfileForm(
  initialValues: UserProfileFormData,
  onSuccess?: () => void
) {
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialValues,
  });

  const onSubmit = useCallback(
    async (data: ProfileFormSchema) => {
      setSaveError(null);
      setIsSubmitting(true);
      try {
        await updateProfile(data);
        onSuccess?.();
      } catch {
        setSaveError("Не удалось сохранить данные. Попробуйте позже.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSuccess]
  );

  return {
    ...form,
    onSubmit,
    isSubmitting,
    saveError,
    setSaveError,
  };
}
