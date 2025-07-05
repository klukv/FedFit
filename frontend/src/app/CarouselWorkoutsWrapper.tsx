"use client";

import { Carousel } from "@/shared/ui";
import { mockItemsForCarousel } from "../data/mock";
import { Workout, WorkoutItem, WorkoutItemVariants } from "@/modules/workout";
import { StaticImageData } from "next/image";

interface IProps {
  items: (Omit<Workout, "value"> & { image: StaticImageData })[];
}

const CarouselWorkoutsClientWrapper = (props: IProps) => {
  return (
    <Carousel
      items={props.items}
      renderItem={(item) => (
        <WorkoutItem
          key={item.id}
          type={WorkoutItemVariants.SMALL}
          title={item.name}
          backgroundImage={{
            image: item.image.src,
          }}
        />
      )}
    />
  );
};

export default CarouselWorkoutsClientWrapper;
