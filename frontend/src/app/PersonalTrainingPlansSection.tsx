"use client";

import { Montserrat } from "next/font/google";
import clsx from "clsx";
import { useTrainingPlanSurveyModal } from "@/modules/trainingPlanSurvey";
import type { TrainingPlan } from "@/modules/workout/types";
import CarouselTrainingPlansWrapper from "./CarouselTrainingPlansWrapper";
import "./personalTrainingPlansSection.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
});

interface PersonalTrainingPlansSectionProps {
  items: Omit<TrainingPlan, "workouts">[];
}

/** Секция личных планов: карусель или empty state с переходом к опроснику. */
const PersonalTrainingPlansSection = ({
  items,
}: PersonalTrainingPlansSectionProps) => {
  const { openModal } = useTrainingPlanSurveyModal();

  if (items.length === 0) {
    return (
      <div className="personal-plans-empty" role="status">
        <p className={clsx("personal-plans-empty__text", montserrat.className)}>
          У вас пока нет данных. Вы можете{" "}
          <button
            type="button"
            className="personal-plans-empty__link"
            onClick={openModal}
          >
            сгенерировать план
          </button>
        </p>
      </div>
    );
  }

  return <CarouselTrainingPlansWrapper items={items} />;
};

export default PersonalTrainingPlansSection;
