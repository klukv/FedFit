import {
  GOAL_OPTIONS,
  LEVEL_OPTIONS,
} from "../../constants/surveyOptions";
import type { SurveyFormValues, SurveyGoal, SurveyLevel } from "../../types";
import SurveyChip from "./SurveyChip";
import SurveyTile from "./SurveyTile";
import "./survey-shared.css";

interface SurveyStepGoalProps {
  values: SurveyFormValues;
  onGoalChange: (goal: SurveyGoal) => void;
  onLevelChange: (level: SurveyLevel) => void;
}

/** Шаг 1: цель и уровень подготовки. */
const SurveyStepGoal = ({
  values,
  onGoalChange,
  onLevelChange,
}: SurveyStepGoalProps) => (
  <div className="survey-panel">
    <section className="survey-panel__group" aria-labelledby="survey-goal-title">
      <h3 id="survey-goal-title" className="survey-panel__title">
        Какая у вас цель?
      </h3>
      <div className="survey-panel__tiles" role="group" aria-label="Цель тренировок">
        {GOAL_OPTIONS.map((option) => (
          <SurveyTile
            key={option.value}
            label={option.label}
            selected={values.goal === option.value}
            onClick={() => onGoalChange(option.value)}
          />
        ))}
      </div>
    </section>

    <section className="survey-panel__group" aria-labelledby="survey-level-title">
      <h3 id="survey-level-title" className="survey-panel__title">
        Ваш уровень
      </h3>
      <div className="survey-panel__chips" role="group" aria-label="Уровень подготовки">
        {LEVEL_OPTIONS.map((option) => (
          <SurveyChip
            key={option.value}
            label={option.label}
            selected={values.level === option.value}
            onClick={() => onLevelChange(option.value)}
          />
        ))}
      </div>
    </section>
  </div>
);

export default SurveyStepGoal;
