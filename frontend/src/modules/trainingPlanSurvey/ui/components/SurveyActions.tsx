import clsx from "clsx";
import { ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";

interface SurveyActionsProps {
  showBack?: boolean;
  primaryLabel?: string;
  onBack?: () => void;
  onPrimary?: () => void;
  isSubmitting?: boolean;
}

/** Кнопки «Назад» и основное действие. */
const SurveyActions = ({
  showBack = false,
  primaryLabel = "Далее",
  onBack,
  onPrimary,
  isSubmitting = false,
}: SurveyActionsProps) => (
  <div
    className={clsx(
      "survey-actions",
      !showBack && "survey-actions--single"
    )}
  >
    {showBack && onBack && (
      <ButtonLink
        type={ButtonLinkTypes.Button}
        title="Назад"
        variant="tertiary"
        onClickHandler={onBack}
        disabled={isSubmitting}
      />
    )}
    {onPrimary && (
      <ButtonLink
        type={ButtonLinkTypes.Button}
        title={primaryLabel}
        variant="default"
        onClickHandler={onPrimary}
        disabled={isSubmitting}
        loading={isSubmitting}
      />
    )}
  </div>
);

export default SurveyActions;
