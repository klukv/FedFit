"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileFormSchema, type ProfileFormSchema } from "@/modules/Profile/schemas";
import type { UserProfileFormData } from "@/modules/Profile/types";

export function useProfileForm(initialValues: UserProfileFormData) {
  return useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: initialValues,
  });
}
