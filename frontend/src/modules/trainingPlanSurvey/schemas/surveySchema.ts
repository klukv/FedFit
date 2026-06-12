import { z } from "zod";

export const surveyGoalSchema = z.enum([
  "weight_loss",
  "muscle_gain",
  "endurance",
  "general_fitness",
]);

export const surveyLevelSchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
]);

export const surveyEquipmentSchema = z.enum([
  "none",
  "dumbbells",
  "barbell",
  "pullup_bar",
  "kettlebell",
]);

export const surveyRestrictionSchema = z.enum(["knee", "back", "shoulder"]);

export const surveyDurationSchema = z.union([
  z.literal(15),
  z.literal(30),
  z.literal(45),
  z.literal(60),
]);

export const surveyStep1Schema = z.object({
  goal: surveyGoalSchema,
  level: surveyLevelSchema,
});

export const surveyStep2Schema = z.object({
  equipment: z
    .array(surveyEquipmentSchema)
    .min(1, "Выберите хотя бы один вариант инвентаря"),
});

export const surveyStep3Schema = z.object({
  frequency: z
    .number()
    .int()
    .min(1, "Укажите частоту тренировок")
    .max(7),
  duration_preference: surveyDurationSchema,
});

export const surveyFormSchema = z.object({
  goal: surveyGoalSchema,
  level: surveyLevelSchema,
  equipment: surveyStep2Schema.shape.equipment,
  frequency: surveyStep3Schema.shape.frequency,
  duration_preference: surveyDurationSchema,
  restrictions: z.array(surveyRestrictionSchema),
  muscleGroup: z.array(z.string()).optional().default([]),
});
