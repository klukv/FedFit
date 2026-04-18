"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, ButtonLink, Card, FormField } from "@/shared/ui";
import { ButtonLinkTypes, CardTypes } from "@/shared/types";
import { FiArrowLeft, FiCheck, FiCornerDownLeft } from "react-icons/fi";
import "./WorkoutExercisesCountModal.css";
import { formatCalories, formatDuration } from "../../utils";
import { workoutCaloriesService } from "../../service";
import {
  buildExerciseSetsFormSchema,
  type ExerciseSetsFormValues,
} from "../../schemas";
import type { WorkoutCalorieUser } from "../../types/calories";

interface WorkoutExercisesCountModalProps {
  isOpen: boolean;
  onFinishExercise: (sets: number) => void;
  onClose: () => void;
  allSetsCount: number;
  exerciseDurationSeconds: number;
  calorieUser: WorkoutCalorieUser | null;
  strengthMet: number;
  kcalPerMinuteFallback: number;
}

const FORM_ID = "workout-exercise-sets-form";

const WorkoutExercisesCountModal = (props: WorkoutExercisesCountModalProps) => {
  const [isNotCompletedExercise, setIsNotCompletedExercise] = useState(false);

  const plannedSetsSafe = Math.max(1, props.allSetsCount);

  const schema = useMemo(
    () => buildExerciseSetsFormSchema(props.allSetsCount),
    [props.allSetsCount],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ExerciseSetsFormValues>({
    resolver: zodResolver(schema) as Resolver<ExerciseSetsFormValues>,
    defaultValues: { sets: 0 },
  });

  const setsWatched = watch("sets");

  const previewCalories = useMemo(() => {
    const done = typeof setsWatched === "number" && Number.isFinite(setsWatched)
      ? setsWatched
      : 0;
    return workoutCaloriesService.estimateExerciseCaloriesPreview({
      calorieUser: props.calorieUser,
      exerciseDurationSeconds: props.exerciseDurationSeconds,
      strengthMet: props.strengthMet,
      plannedSetsSafe,
      setsDone: done,
      kcalPerMinuteFallback: props.kcalPerMinuteFallback,
    });
  }, [
    plannedSetsSafe,
    props.calorieUser,
    props.exerciseDurationSeconds,
    props.kcalPerMinuteFallback,
    props.strengthMet,
    setsWatched,
  ]);

  const onSubmit = (data: ExerciseSetsFormValues) => {
    if (data.sets !== plannedSetsSafe) {
      setIsNotCompletedExercise(true);
      return;
    }
    props.onFinishExercise(data.sets);
    props.onClose();
  };

  const finishPartial = () => {
    void handleSubmit((data) => {
      props.onFinishExercise(data.sets);
      props.onClose();
    })();
  };

  useEffect(() => {
    if (!props.isOpen) return;
    reset({ sets: Math.max(0, props.allSetsCount) });
    setIsNotCompletedExercise(false);
  }, [props.isOpen, props.allSetsCount, reset]);

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={props.onClose}
      className="workout-exercise-count-modal"
      ariaLabel="Результаты выполнения упражнения"
    >
      <div className="workout-exercise-count-modal__content">
        <h2 className="workout-exercise-count-modal__title" id="exercise-count-modal-title">
          Введите количество выполненных подходов
        </h2>

        <div className="workout-exercise-count-modal__stats" role="group" aria-labelledby="exercise-count-modal-title">
          <div className="workout-exercise-count-modal__stat-card">
            <span className="workout-exercise-count-modal__stat-label">Активность упражнения</span>
            <span className="workout-exercise-count-modal__stat-value">
              {props.exerciseDurationSeconds > 0
                ? formatDuration(props.exerciseDurationSeconds)
                : "—"}
            </span>
          </div>
          <div className="workout-exercise-count-modal__stat-card workout-exercise-count-modal__stat-card--wide">
            <span className="workout-exercise-count-modal__stat-label">
              Примерно потрачено за это упражнение
            </span>
            <span
              className="workout-exercise-count-modal__stat-value workout-exercise-count-modal__stat-value--multiline"
              aria-live="polite"
            >
              {props.exerciseDurationSeconds > 0 ? formatCalories(previewCalories) : "—"}
            </span>
          </div>
        </div>

        <form
          id={FORM_ID}
          className="workout-exercise-count-modal__form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-labelledby="exercise-count-modal-title"
        >
          <FormField
            variant="profile"
            name="sets"
            label={`Подходы (из ${plannedSetsSafe})`}
            type="number"
            register={register("sets", { valueAsNumber: true })}
            error={errors.sets}
            min={0}
            max={plannedSetsSafe}
          />

          <div className="workout-exercise-count-modal__actions">
            <ButtonLink
              type={ButtonLinkTypes.Button}
              icon={<FiCheck aria-hidden />}
              title="Подтвердить"
              variant="default"
              buttonType="submit"
              onClickHandler={handleSubmit(onSubmit)}
            />
          </div>
        </form>

        {isNotCompletedExercise && (
          <Card
            type={CardTypes.Block}
            contentClassName="completing-exercises__actions"
            title="Вы выполнили не все подходы. Хотите продолжить?"
          >
            <ButtonLink
              type={ButtonLinkTypes.Button}
              icon={<FiArrowLeft aria-hidden />}
              title="Вернуться к упражнению"
              variant="default"
              onClickHandler={() => props.onClose()}
            />
            <ButtonLink
              type={ButtonLinkTypes.Button}
              icon={<FiCornerDownLeft aria-hidden />}
              title="Завершить упражнение"
              variant="tertiary"
              onClickHandler={finishPartial}
            />
          </Card>
        )}
      </div>
    </Modal>
  );
};

export default WorkoutExercisesCountModal;
