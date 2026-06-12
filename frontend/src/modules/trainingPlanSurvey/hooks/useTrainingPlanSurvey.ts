"use client";

import { useCallback, useMemo, useState } from "react";
import { DEFAULT_SURVEY_VALUES } from "../constants/defaultValues";
import {
  surveyStep1Schema,
  surveyStep2Schema,
  surveyStep3Schema,
  surveyFormSchema,
} from "../schemas";
import { TrainingPlanSurveyService } from "../service";
import type { TrainingPlan } from "@/modules/workout/types";
import type {
  SurveyFormValues,
  SurveyStepDirection,
  SurveyStepNumber,
  SurveyGoal,
  SurveyLevel,
  SurveyEquipment,
  SurveyRestriction,
  SurveyDuration,
  SurveySubmitPayload,
} from "../types";
import { buildSurveySummary, toSurveySubmitPayload } from "../utils";
import { SurveyPhase } from "../types/entities";

interface UseTrainingPlanSurveyOptions {
  onClose: () => void;
  onSuccess?: (plan: TrainingPlan) => void;
}

function getStepValidationError(
  step: SurveyStepNumber,
  values: SurveyFormValues
): string | null {
  if (step === 1) {
    const result = surveyStep1Schema.safeParse({
      goal: values.goal,
      level: values.level,
    });
    if (!result.success) {
      if (!values.goal) return "Выберите цель тренировок";
      if (!values.level) return "Выберите уровень подготовки";
      return result.error.issues[0]?.message ?? "Заполните обязательные поля";
    }
    return null;
  }

  if (step === 2) {
    const result = surveyStep2Schema.safeParse({ equipment: values.equipment });
    return result.success
      ? null
      : (result.error.issues[0]?.message ?? "Выберите инвентарь");
  }

  if (step === 3) {
    const result = surveyStep3Schema.safeParse({
      frequency: values.frequency,
      duration_preference: values.duration_preference,
    });
    if (!result.success) {
      if (values.frequency == null) return "Укажите количество тренировок в неделю";
      if (values.duration_preference == null) return "Выберите длительность тренировки";
      return result.error.issues[0]?.message ?? "Заполните обязательные поля";
    }
    return null;
  }

  return null;
}

export function useTrainingPlanSurvey({
  onClose,
  onSuccess,
}: UseTrainingPlanSurveyOptions) {
  const service = useMemo(() => new TrainingPlanSurveyService(), []);

  const [phase, setPhase] = useState<SurveyPhase>("survey");
  const [step, setStep] = useState<SurveyStepNumber>(1);
  const [direction, setDirection] = useState<SurveyStepDirection>("forward");
  const [values, setValues] = useState<SurveyFormValues>(DEFAULT_SURVEY_VALUES);
  const [stepError, setStepError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewPlan, setPreviewPlan] = useState<TrainingPlan | null>(null);
  const [lastPayload, setLastPayload] = useState<SurveySubmitPayload | null>(null);

  const summary = useMemo(() => buildSurveySummary(values), [values]);

  const reset = useCallback(() => {
    setPhase("survey");
    setStep(1);
    setDirection("forward");
    setValues(DEFAULT_SURVEY_VALUES);
    setStepError(null);
    setSubmitError(null);
    setSaveError(null);
    setIsGenerating(false);
    setIsSaving(false);
    setPreviewPlan(null);
    setLastPayload(null);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const setGoal = useCallback((goal: SurveyGoal) => {
    setValues((prev) => ({ ...prev, goal }));
    setStepError(null);
  }, []);

  const setLevel = useCallback((level: SurveyLevel) => {
    setValues((prev) => ({ ...prev, level }));
    setStepError(null);
  }, []);

  const setEquipment = useCallback((equipment: SurveyEquipment[]) => {
    setValues((prev) => ({ ...prev, equipment }));
    setStepError(null);
  }, []);

  const setFrequency = useCallback((frequency: number) => {
    setValues((prev) => ({ ...prev, frequency }));
    setStepError(null);
  }, []);

  const setDuration = useCallback((duration_preference: SurveyDuration) => {
    setValues((prev) => ({ ...prev, duration_preference }));
    setStepError(null);
  }, []);

  const setRestrictions = useCallback((restrictions: SurveyRestriction[]) => {
    setValues((prev) => ({ ...prev, restrictions }));
    setStepError(null);
  }, []);

  const goBack = useCallback(() => {
    if (phase !== "survey") return;

    setDirection("back");
    setStepError(null);
    setSubmitError(null);
    setStep((current) => Math.max(1, current - 1) as SurveyStepNumber);
  }, [phase]);

  const goNext = useCallback(() => {
    const error = getStepValidationError(step, values);
    if (error) {
      setStepError(error);
      return;
    }

    setDirection("forward");
    setStepError(null);
    setStep((current) => Math.min(4, current + 1) as SurveyStepNumber);
  }, [step, values]);

  const generatePlan = useCallback(
    async (payload: SurveySubmitPayload) => {
      setSubmitError(null);
      setSaveError(null);
      setIsGenerating(true);
      setPhase("generating");

      try {
        const plan = await service.createFromSurvey(payload);
        setPreviewPlan(plan);
        setPhase("preview");
      } catch {
        setSubmitError(
          "Не удалось сформировать план. Попробуйте ещё раз чуть позже."
        );
        setPhase("survey");
        setStep(4);
      } finally {
        setIsGenerating(false);
      }
    },
    [service]
  );

  const submit = useCallback(async () => {
    const stepFourError = getStepValidationError(3, values);
    if (stepFourError) {
      setStepError(stepFourError);
      setStep(3);
      return;
    }

    const payload = toSurveySubmitPayload(values);

    if (payload == null) {
      setSubmitError("Заполните все обязательные поля анкеты");
      return;
    }

    const validation = surveyFormSchema.safeParse(payload);

    if (!validation.success) {
      setSubmitError(
        validation.error.issues[0]?.message ?? "Проверьте заполнение анкеты"
      );
      return;
    }

    setLastPayload(validation.data);
    await generatePlan(validation.data);
  }, [values, generatePlan]);

  const regeneratePlan = useCallback(async () => {
    if (!lastPayload) return;
    await generatePlan(lastPayload);
  }, [lastPayload, generatePlan]);

  const savePlan = useCallback(async () => {
    if (!previewPlan) return;

    setSaveError(null);
    setIsSaving(true);
    setPhase("saving");

    try {
      const savedPlan = await service.savePlan(previewPlan);
      onSuccess?.(savedPlan);
      handleClose();
    } catch {
      setSaveError("Не удалось сохранить план. Попробуйте ещё раз.");
      setPhase("preview");
    } finally {
      setIsSaving(false);
    }
  }, [previewPlan, service, onSuccess, handleClose]);

  const cancelPreview = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handlePrimaryAction = useCallback(() => {
    if (step === 4) {
      void submit();
      return;
    }
    goNext();
  }, [step, submit, goNext]);

  return {
    phase,
    step,
    direction,
    values,
    summary,
    previewPlan,
    stepError,
    submitError,
    saveError,
    isGenerating,
    isSaving,
    isSubmitting: isGenerating && phase === "survey",
    setGoal,
    setLevel,
    setEquipment,
    setFrequency,
    setDuration,
    setRestrictions,
    goBack,
    handlePrimaryAction,
    handleClose,
    regeneratePlan,
    savePlan,
    cancelPreview,
    reset,
  };
}
