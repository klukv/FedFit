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
  SurveyPlanGenerating,
  SurveyPlanPreview,
  SurveyPlanPreviewActions,
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

  const isSurveyPhase = survey.phase === "survey";
  const isPreviewFlow =
    survey.phase === "generating" ||
    survey.phase === "preview" ||
    survey.phase === "saving";

  const actions = STEP_ACTIONS[survey.step];
  const activeError = survey.stepError ?? survey.submitError ?? survey.saveError;

  const modalTitle = isPreviewFlow ? "Ваш план готов" : "Составим ваш план";

  const renderSurveyStep = () => {
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

  const renderContent = () => {
    if (survey.phase === "generating" || survey.phase === "saving") {
      return <SurveyPlanGenerating />;
    }

    if (survey.phase === "preview" && survey.previewPlan) {
      return (
        <SurveyPlanPreview plan={survey.previewPlan} summary={survey.summary} />
      );
    }

    return (
      <SurveyStepTransition step={survey.step} direction={survey.direction}>
        {renderSurveyStep()}
      </SurveyStepTransition>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={survey.handleClose}
      className={clsx("survey-modal", isPreviewFlow && "survey-modal--preview")}
      ariaLabel={
        isPreviewFlow
          ? "Предпросмотр плана тренировок"
          : "Составление плана тренировок"
      }
    >
      <div className={`survey-modal__inner ${montserrat.className}`}>
        <header className="survey-modal__header">
          <h2 className="survey-modal__title">{modalTitle}</h2>
          <button
            type="button"
            className="survey-modal__close"
            onClick={survey.handleClose}
            aria-label="Закрыть"
            disabled={survey.isGenerating || survey.isSaving}
          >
            ×
          </button>
        </header>

        {isSurveyPhase && <SurveyProgress activeStep={survey.step} />}

        <div
          className={clsx(
            "survey-modal__glass",
            survey.step === 4 && isSurveyPhase && "survey-modal__glass--tall",
            isPreviewFlow && "survey-modal__glass--preview"
          )}
        >
          {activeError && (
            <p className="survey-modal__error" role="alert">
              {activeError}
            </p>
          )}

          {renderContent()}
        </div>

        {isSurveyPhase && (
          <SurveyActions
            showBack={actions.showBack}
            primaryLabel={actions.primaryLabel}
            onBack={survey.goBack}
            onPrimary={survey.handlePrimaryAction}
            isSubmitting={survey.isSubmitting}
          />
        )}

        {survey.phase === "preview" && survey.previewPlan && (
          <SurveyPlanPreviewActions
            onCancel={survey.cancelPreview}
            onRegenerate={survey.regeneratePlan}
            onSave={survey.savePlan}
            isRegenerating={survey.isGenerating}
            isSaving={survey.isSaving}
          />
        )}
      </div>
    </Modal>
  );
};

export default TrainingPlanSurveyModal;
