"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import clsx from "clsx";
import { ButtonLink } from "@/shared/ui";
import { TRAINING_PLANS_URL } from "@/shared/constants";
import { ButtonLinkTypes } from "@/shared/types";
import type { TrainingPlan } from "@/modules/workout/types";
import { TrainingPlanSurveyModal } from "../TrainingPlanSurveyModal";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
});

/** Кнопка в шапке и модальное окно опросника. */
const TrainingPlanSurveyTrigger = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = (plan: TrainingPlan) => {
    router.push(`${TRAINING_PLANS_URL}/${plan.id}`);
  };

  return (
    <>
      <div className={clsx("header__plan-cta", montserrat.className)}>
        <ButtonLink
          type={ButtonLinkTypes.Button}
          title="Сформировать план тренировок"
          variant="default"
          onClickHandler={() => setIsOpen(true)}
        />
      </div>

      <TrainingPlanSurveyModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default TrainingPlanSurveyTrigger;
