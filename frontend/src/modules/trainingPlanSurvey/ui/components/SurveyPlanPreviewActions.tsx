import clsx from "clsx";
import { ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";

interface SurveyPlanPreviewActionsProps {
  onCancel: () => void;
  onRegenerate: () => void;
  onSave: () => void;
  isRegenerating?: boolean;
  isSaving?: boolean;
}

/** Действия предпросмотра: отмена, перегенерация, сохранение. */
const SurveyPlanPreviewActions = ({
  onCancel,
  onRegenerate,
  onSave,
  isRegenerating = false,
  isSaving = false,
}: SurveyPlanPreviewActionsProps) => {
  const isBusy = isRegenerating || isSaving;

  return (
    <div
      className={clsx("plan-preview-actions", isBusy && "plan-preview-actions--busy")}
      role="group"
      aria-label="Действия с планом"
    >
      <ButtonLink
        type={ButtonLinkTypes.Button}
        title="Отменить"
        variant="tertiary"
        onClickHandler={onCancel}
        disabled={isBusy}
      />
      <ButtonLink
        type={ButtonLinkTypes.Button}
        title="Сгенерировать новый"
        variant="secondary"
        onClickHandler={onRegenerate}
        disabled={isBusy}
        loading={isRegenerating}
      />
      <ButtonLink
        type={ButtonLinkTypes.Button}
        title="Сохранить план"
        variant="default"
        onClickHandler={onSave}
        disabled={isBusy}
        loading={isSaving}
      />
    </div>
  );
};

export default SurveyPlanPreviewActions;
