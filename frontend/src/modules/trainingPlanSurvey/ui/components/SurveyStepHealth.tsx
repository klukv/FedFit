import clsx from "clsx";
import { RESTRICTION_OPTIONS } from "../../constants/surveyOptions";
import type { SurveyFormValues, SurveyRestriction, SurveySummary } from "../../types";
import {
  isNoRestrictionsSelected,
  isRestrictionSelected,
  toggleRestriction,
} from "../../utils";
import SurveyChip from "./SurveyChip";
import "./survey-shared.css";

interface SurveyStepHealthProps {
  values: SurveyFormValues;
  summary: SurveySummary;
  onRestrictionsChange: (restrictions: SurveyRestriction[]) => void;
}

/** Шаг 4: ограничения и итоговая сводка. */
const SurveyStepHealth = ({
  values,
  summary,
  onRestrictionsChange,
}: SurveyStepHealthProps) => (
  <div className="survey-panel">
    <section className="survey-panel__group" aria-labelledby="survey-health-title">
      <h3 id="survey-health-title" className="survey-panel__title">
        Есть ли ограничения?
      </h3>
      <p className="survey-panel__hint">
        Можно пропустить, если ограничений нет
      </p>
      <div className="survey-panel__chips" role="group" aria-label="Ограничения">
        {RESTRICTION_OPTIONS.map((option) => {
          const isNone = option.value === "none";
          const selected = isNone
            ? isNoRestrictionsSelected(values.restrictions)
            : isRestrictionSelected(values.restrictions, option.value);

          return (
            <SurveyChip
              key={option.value}
              label={option.label}
              selected={selected}
              onClick={() => {
                if (isNone) {
                  onRestrictionsChange([]);
                  return;
                }
                onRestrictionsChange(
                  toggleRestriction(values.restrictions, option.value)
                );
              }}
            />
          );
        })}
      </div>
    </section>

    <aside className="survey-summary" aria-label="Итог анкеты">
      <p className="survey-summary__label">Итог</p>
      <p className="survey-summary__line">{summary.goalLevel}</p>
      <p className="survey-summary__line">{summary.rhythm}</p>
      <p className="survey-summary__line">{summary.equipment}</p>
      <p
        className={clsx(
          "survey-summary__line",
          "survey-summary__restriction",
          !summary.restriction && "survey-summary__line--empty"
        )}
      >
        {summary.restriction ?? "\u00A0"}
      </p>
    </aside>
  </div>
);

export default SurveyStepHealth;
