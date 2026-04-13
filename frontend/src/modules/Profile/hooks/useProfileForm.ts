"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, type ProfileFormSchema } from "@/modules/profile/schemas";
import type { UserProfileFormData } from "@/modules/profile/types";

export function useProfileForm(initialValues: UserProfileFormData) {
  return useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialValues,
  });
}
