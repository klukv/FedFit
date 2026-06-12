import clsx from "clsx";
import { SURVEY_STEPS } from "../../constants/surveyOptions";

interface SurveyProgressProps {
  /** Активный шаг (1–4). */
  activeStep: number;
}

/** Индикатор прогресса по шагам опросника. */
const SurveyProgress = ({ activeStep }: SurveyProgressProps) => (
  <nav className="survey-progress" aria-label="Шаги опросника">
    <ol className="survey-progress__list">
      {SURVEY_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < activeStep;
        const isActive = stepNumber === activeStep;

        return (
          <li
            key={step.id}
            className={clsx(
              "survey-progress__item",
              (isCompleted || isActive) && "survey-progress__item--reached",
              isActive && "survey-progress__item--active"
            )}
          >
            <span className="survey-progress__dot" aria-hidden />
            <span className="survey-progress__label">{step.label}</span>
          </li>
        );
      })}
    </ol>
  </nav>
);

export default SurveyProgress;
