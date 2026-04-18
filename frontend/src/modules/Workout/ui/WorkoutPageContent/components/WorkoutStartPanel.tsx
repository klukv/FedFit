import { ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";

interface WorkoutStartPanelProps {
  isVisible: boolean;
  onStart: () => void;
}

const WorkoutStartPanel = ({ isVisible, onStart }: WorkoutStartPanelProps) => (
  <div
    className={`workout-detail-page__start-button ${isVisible ? "workout-detail-page__start-button--visible" : "workout-detail-page__start-button--hidden"}`}
  >
    <ButtonLink
      type={ButtonLinkTypes.Button}
      title="Начать тренировку"
      variant="default"
      onClickHandler={onStart}
    />
  </div>
);

export default WorkoutStartPanel;
