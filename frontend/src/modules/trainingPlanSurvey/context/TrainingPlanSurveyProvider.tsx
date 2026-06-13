"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type PropsWithChildren,
} from "react";
import { useRouter } from "next/navigation";
import { TRAINING_PLANS_URL } from "@/shared/constants";
import type { TrainingPlan } from "@/modules/workout/types";
import { TrainingPlanSurveyModal } from "../ui/TrainingPlanSurveyModal";

interface TrainingPlanSurveyContextValue {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const TrainingPlanSurveyContext =
  createContext<TrainingPlanSurveyContextValue | null>(null);

/** Доступ к модалке опросника из шапки и других секций приложения. */
export function useTrainingPlanSurveyModal() {
  const context = useContext(TrainingPlanSurveyContext);

  if (!context) {
    throw new Error(
      "useTrainingPlanSurveyModal must be used within TrainingPlanSurveyProvider"
    );
  }

  return context;
}

/** Единый провайдер модалки «Сформировать план тренировок». */
export function TrainingPlanSurveyProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const handleSuccess = (plan: TrainingPlan) => {
    router.push(`${TRAINING_PLANS_URL}/${plan.id}`);
  };

  return (
    <TrainingPlanSurveyContext.Provider
      value={{ isOpen, openModal, closeModal }}
    >
      {children}
      <TrainingPlanSurveyModal
        isOpen={isOpen}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </TrainingPlanSurveyContext.Provider>
  );
}
