import { EQUIPMENT_OPTIONS } from "../../constants/surveyOptions";
import type { SurveyEquipment, SurveyFormValues } from "../../types";
import { isEquipmentSelected, toggleEquipment } from "../../utils";
import SurveyChip from "./SurveyChip";
import "./survey-shared.css";

interface SurveyStepEquipmentProps {
  values: SurveyFormValues;
  onEquipmentChange: (equipment: SurveyEquipment[]) => void;
}

/** Шаг 2: доступный инвентарь. */
const SurveyStepEquipment = ({
  values,
  onEquipmentChange,
}: SurveyStepEquipmentProps) => (
  <div className="survey-panel">
    <section className="survey-panel__group" aria-labelledby="survey-equipment-title">
      <h3 id="survey-equipment-title" className="survey-panel__title">
        Что есть под рукой?
      </h3>
      <p className="survey-panel__hint">
        Выберите весь доступный инвентарь
      </p>
      <div className="survey-panel__chips" role="group" aria-label="Инвентарь">
        {EQUIPMENT_OPTIONS.map((option) => (
          <SurveyChip
            key={option.value}
            label={option.label}
            selected={isEquipmentSelected(values.equipment, option.value)}
            onClick={() =>
              onEquipmentChange(toggleEquipment(values.equipment, option.value))
            }
          />
        ))}
      </div>
    </section>
  </div>
);

export default SurveyStepEquipment;
