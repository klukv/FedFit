"use client";

import { useRouter } from "next/navigation";
import { Modal, ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";
import { FiHome, FiRotateCcw } from "react-icons/fi";
import { formatDuration, formatCalories } from "../../utils";
import "./workoutCompleteModal.css";

interface WorkoutCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  elapsedTime: number;
  estimatedCalories: number;
  isCompleteWorkout: boolean;
  caloriesSummaryLabel?: string;
}

const DEFAULT_CALORIES_LABEL =
  "Суммарно за выполненные упражнения потрачено примерно";

const WorkoutCompleteModal = (props: WorkoutCompleteModalProps) => {
  const router = useRouter();
  const caloriesLabel = props.caloriesSummaryLabel ?? DEFAULT_CALORIES_LABEL;

  const handleGoHome = () => {
    props.onClose();
    router.push("/");
  };

  const handleContinue = () => {
    if (props.onContinue) {
      props.onContinue();
    } else {
      props.onClose();
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      className="workout-complete-modal"
      ariaLabel="Результаты тренировки"
    >
      <div className="workout-complete-modal__content">
        {/* Заголовок */}
        <h2 className="workout-complete-modal__title">
          Тренировка выполнена!
        </h2>

        {/* Статистика */}
        <div className="workout-complete-modal__stats">
          {/* Карточка времени */}
          <div className="workout-complete-modal__stat-card">
            <span className="workout-complete-modal__stat-label">Время</span>
            <span className="workout-complete-modal__stat-value">
              {formatDuration(props.elapsedTime)}
            </span>
          </div>

          {/* Карточка калорий */}
          <div className="workout-complete-modal__stat-card workout-complete-modal__stat-card--wide">
            <span className="workout-complete-modal__stat-label">
              {caloriesLabel}
            </span>
            <span className="workout-complete-modal__stat-value workout-complete-modal__stat-value--multiline">
              {formatCalories(props.estimatedCalories)}
            </span>
          </div>
        </div>

        {/* Кнопки */}
        <div className="workout-complete-modal__actions">
          {!props.isCompleteWorkout && (
            <ButtonLink
              type={ButtonLinkTypes.Button}
              icon={<FiRotateCcw aria-hidden />}
              title="Вернуться к тренировке"
              variant="default"
              onClickHandler={handleContinue}
            />
          )}
          <ButtonLink
            type={ButtonLinkTypes.Button}
            icon={<FiHome aria-hidden />}
            title="Перейти на главную"
            variant="tertiary"
            onClickHandler={handleGoHome}
          />
        </div>
      </div>
    </Modal>
  );
};

export default WorkoutCompleteModal;
