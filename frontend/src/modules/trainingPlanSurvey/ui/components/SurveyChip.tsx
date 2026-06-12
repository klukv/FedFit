import clsx from "clsx";
import "./survey-shared.css";

interface SurveyChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

/** Пилюля выбора (уровень, инвентарь, длительность, ограничения). */
const SurveyChip = ({ label, selected = false, onClick }: SurveyChipProps) => (
  <button
    type="button"
    className={clsx("survey-chip", selected && "survey-chip--selected")}
    aria-pressed={selected}
    onClick={onClick}
  >
    {label}
  </button>
);

export default SurveyChip;
