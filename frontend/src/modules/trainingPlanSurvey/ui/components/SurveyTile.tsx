import clsx from "clsx";
import "./survey-shared.css";

interface SurveyTileProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

/** Плитка выбора цели тренировок. */
const SurveyTile = ({ label, selected = false, onClick }: SurveyTileProps) => (
  <button
    type="button"
    className={clsx("survey-tile", selected && "survey-tile--selected")}
    aria-pressed={selected}
    onClick={onClick}
  >
    {label}
    {selected && (
      <span className="survey-tile__check" aria-hidden>
        ✓
      </span>
    )}
  </button>
);

export default SurveyTile;
