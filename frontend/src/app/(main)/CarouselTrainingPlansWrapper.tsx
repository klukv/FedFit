"use client";

import { Carousel } from "@/shared/ui";
import {
  WorkoutItem,
  WorkoutItemVariants,
  getTrainingPlanImageSrc,
} from "@/modules/workout";
import { TrainingPlanSummary } from "@/modules/workout/types";
import { TRAINING_PLANS_URL } from "@/shared/constants";

interface IProps {
    items: TrainingPlanSummary[];
}

const CarouselTrainingPlansWrapper = (props: IProps) => {
    return (
        <Carousel
            items={props.items}
            renderItem={(item) => (
                <WorkoutItem
                    key={item.id}
                    type={WorkoutItemVariants.LARGE_WITH_BUTTON}
                    title={item.name}
                    backgroundImage={{
                        image: getTrainingPlanImageSrc(item),
                    }}
                    buttonLink={{
                        href: `${TRAINING_PLANS_URL}/${item.id}`,
                        title: "Перейти",
                    }}
                />
            )}
        />
    );
};

export default CarouselTrainingPlansWrapper;
