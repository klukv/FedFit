"use client";

import { useEffect } from "react";
import { Montserrat } from "next/font/google";
import clsx from "clsx";
import { Modal } from "@/shared/ui";
import type { TrainingPlan } from "@/modules/workout/types";
import { useTrainingPlanSurvey } from "../../hooks";
import type { SurveyStepNumber } from "../../types";
import {
  SurveyActions,
  SurveyProgress,
  SurveyStepEquipment,
  SurveyStepGoal,
  SurveyStepHealth,
  SurveyStepRhythm,
  SurveyStepTransition,
} from "../components";
import "./trainingPlanSurveyModal.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
});

const STEP_ACTIONS: Record<
  SurveyStepNumber,
  { showBack: boolean; primaryLabel: string }
> = {
  1: { showBack: false, primaryLabel: "Далее" },
  2: { showBack: true, primaryLabel: "Далее" },
  3: { showBack: true, primaryLabel: "Далее" },
  4: { showBack: true, primaryLabel: "Сформировать план" },
};

interface TrainingPlanSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (plan: TrainingPlan) => void;
}

/** Модальное окно опросника плана тренировок. */
const TrainingPlanSurveyModal = ({
  isOpen,
  onClose,
  onSuccess,
}: TrainingPlanSurveyModalProps) => {
  const survey = useTrainingPlanSurvey({ onClose, onSuccess });

  useEffect(() => {
    if (!isOpen) {
      survey.reset();
    }
  }, [isOpen, survey.reset]);

  const actions = STEP_ACTIONS[survey.step];

  const renderStep = () => {
    switch (survey.step) {
      case 1:
        return (
          <SurveyStepGoal
            values={survey.values}
            onGoalChange={survey.setGoal}
            onLevelChange={survey.setLevel}
          />
        );
      case 2:
        return (
          <SurveyStepEquipment
            values={survey.values}
            onEquipmentChange={survey.setEquipment}
          />
        );
      case 3:
        return (
          <SurveyStepRhythm
            values={survey.values}
            onFrequencyChange={survey.setFrequency}
            onDurationChange={survey.setDuration}
          />
        );
      case 4:
        return (
          <SurveyStepHealth
            values={survey.values}
            summary={survey.summary}
            onRestrictionsChange={survey.setRestrictions}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={survey.handleClose}
      className="survey-modal"
      ariaLabel="Составление плана тренировок"
    >
      <div className={`survey-modal__inner ${montserrat.className}`}>
        <header className="survey-modal__header">
          <h2 className="survey-modal__title">Составим ваш план</h2>
          <button
            type="button"
            className="survey-modal__close"
            onClick={survey.handleClose}
            aria-label="Закрыть опросник"
          >
            ×
          </button>
        </header>

        <SurveyProgress activeStep={survey.step} />

        <div
          className={clsx(
            "survey-modal__glass",
            survey.step === 4 && "survey-modal__glass--tall"
          )}
        >
          {(survey.stepError || survey.submitError) && (
            <p className="survey-modal__error" role="alert">
              {survey.stepError ?? survey.submitError}
            </p>
          )}

          <SurveyStepTransition step={survey.step} direction={survey.direction}>
            {renderStep()}
          </SurveyStepTransition>
        </div>

        <SurveyActions
          showBack={actions.showBack}
          primaryLabel={actions.primaryLabel}
          onBack={survey.goBack}
          onPrimary={survey.handlePrimaryAction}
          isSubmitting={survey.isSubmitting}
        />
      </div>
    </Modal>
  );
};

export default TrainingPlanSurveyModal;
