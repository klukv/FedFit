"use client";

import { Montserrat } from "next/font/google";
import clsx from "clsx";
import { ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";
import { useTrainingPlanSurveyModal } from "../../context";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
});

/** Кнопка в шапке для открытия модального окна опросника. */
const TrainingPlanSurveyTrigger = () => {
  const { openModal } = useTrainingPlanSurveyModal();

  return (
    <div className={clsx("header__plan-cta", montserrat.className)}>
      <ButtonLink
        type={ButtonLinkTypes.Button}
        title="Сформировать план тренировок"
        variant="default"
        onClickHandler={openModal}
      />
    </div>
  );
};

export default TrainingPlanSurveyTrigger;
