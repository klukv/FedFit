import { IconButton } from "@/shared/ui";
import {
  FiCheckCircle,
  FiFlag,
  FiPause,
  FiPlay,
  FiZap,
} from "react-icons/fi";

export interface WorkoutActiveControlsBarProps {
  isVisible: boolean;
  isPaused: boolean;
  isExerciseInProgress: boolean;
  onTogglePause: () => void;
  onStartExercise: () => void;
  onOpenExerciseComplete: () => void;
  onFinishWorkout: () => void;
}

const WorkoutActiveControlsBar = (props: WorkoutActiveControlsBarProps) => (
  <div
    className={`workout-active-controls ${props.isVisible ? "workout-active-controls--visible" : "workout-active-controls--hidden"}`}
  >
    <div className="workout-controls workout-controls--icon-row">
      <IconButton
        variant="iconOnly"
        icon={props.isPaused ? <FiPlay /> : <FiPause />}
        label={props.isPaused ? "Продолжить" : "Пауза"}
        title={props.isPaused ? "Продолжить тренировку" : "Пауза"}
        onClick={props.onTogglePause}
        ariaLabel={props.isPaused ? "Продолжить тренировку" : "Поставить на паузу"}
      />
      {props.isExerciseInProgress ? (
        <IconButton
          variant="iconOnly"
          icon={<FiCheckCircle />}
          label="Завершить упражнение"
          title="Завершить текущее упражнение"
          onClick={props.onOpenExerciseComplete}
          ariaLabel="Завершить текущее упражнение"
        />
      ) : (
        <IconButton
          variant="iconOnly"
          icon={<FiZap />}
          label="Начать упражнение"
          title="Начать выполнение упражнения"
          onClick={props.onStartExercise}
          ariaLabel="Начать выполнение текущего упражнения"
        />
      )}
      <IconButton
        variant="iconOnly"
        icon={<FiFlag />}
        label="Завершить тренировку"
        title="Завершить тренировку досрочно"
        onClick={props.onFinishWorkout}
        ariaLabel="Завершить тренировку"
      />
    </div>
  </div>
);

export default WorkoutActiveControlsBar;
