"use client";

import { Carousel } from "@/shared/ui";
import { WorkoutItem, WorkoutItemVariants } from "@/modules/workout";
import { TrainingPlanSummary } from "@/modules/workout/types";
import { TRAINING_PLANS, TRAINING_PLANS_URL } from "@/shared/constants";

interface IProps {
    items: TrainingPlanSummary[];
}

const CarouselTrainingPlansWrapper = (props: IProps) => {
    return (
        <Carousel
            items={props.items}
            renderItem={(item, idx) => (
                <WorkoutItem
                    key={item.id}
                    type={WorkoutItemVariants.LARGE_WITH_BUTTON}
                    title={item.name}
                    backgroundImage={{
                        image: TRAINING_PLANS[idx % TRAINING_PLANS.length].image.src,
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
