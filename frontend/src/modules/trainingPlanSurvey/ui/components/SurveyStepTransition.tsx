import type { ReactNode } from "react";
import clsx from "clsx";
import type { SurveyStepDirection, SurveyStepNumber } from "../../types";

interface SurveyStepTransitionProps {
  step: SurveyStepNumber;
  direction: SurveyStepDirection;
  children: ReactNode;
}

/** Анимированная обёртка контента шага. */
const SurveyStepTransition = ({
  step,
  direction,
  children,
}: SurveyStepTransitionProps) => (
  <div
    key={step}
    className={clsx(
      "survey-step-panel",
      direction === "back"
        ? "survey-step-panel--back"
        : "survey-step-panel--forward"
    )}
  >
    {children}
  </div>
);

export default SurveyStepTransition;
