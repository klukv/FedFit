import clsx from "clsx";
import { DURATION_OPTIONS } from "../../constants/surveyOptions";
import type { SurveyDuration, SurveyFormValues } from "../../types";
import { formatFrequencyLabel } from "../../utils";
import SurveyChip from "./SurveyChip";
import "./survey-shared.css";

const FREQUENCY_DAYS = [1, 2, 3, 4, 5, 6, 7] as const;

interface SurveyStepRhythmProps {
  values: SurveyFormValues;
  onFrequencyChange: (frequency: number) => void;
  onDurationChange: (duration: SurveyDuration) => void;
}

/** Шаг 3: частота и длительность тренировок. */
const SurveyStepRhythm = ({
  values,
  onFrequencyChange,
  onDurationChange,
}: SurveyStepRhythmProps) => (
  <div className="survey-panel">
    <section className="survey-panel__group" aria-labelledby="survey-frequency-title">
      <h3 id="survey-frequency-title" className="survey-panel__title">
        Сколько раз в неделю?
      </h3>
      <div className="survey-day-picker" role="group" aria-label="Количество тренировок в неделю">
        {FREQUENCY_DAYS.map((day) => (
          <button
            key={day}
            type="button"
            className={clsx(
              "survey-day-picker__item",
              values.frequency === day && "survey-day-picker__item--selected"
            )}
            aria-pressed={values.frequency === day}
            onClick={() => onFrequencyChange(day)}
          >
            {day}
          </button>
        ))}
      </div>
      {values.frequency != null && (
        <p className="survey-panel__caption survey-panel__caption--animated">
          {formatFrequencyLabel(values.frequency)}
        </p>
      )}
    </section>

    <section className="survey-panel__group" aria-labelledby="survey-duration-title">
      <h3 id="survey-duration-title" className="survey-panel__title">
        Сколько времени на тренировку?
      </h3>
      <div className="survey-panel__chips" role="group" aria-label="Длительность тренировки">
        {DURATION_OPTIONS.map((option) => (
          <SurveyChip
            key={option.value}
            label={option.label}
            selected={values.duration_preference === option.value}
            onClick={() => onDurationChange(option.value)}
          />
        ))}
      </div>
    </section>
  </div>
);

export default SurveyStepRhythm;
