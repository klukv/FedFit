"use client";

import React from "react";
import { Carousel } from "@/shared/ui";
import { mockItemsForCarousel } from "../data/mock";
import { WorkoutItem, WorkoutItemVariants } from "@/modules/workout";

const CarouselWorkoutsWrapper = () => {
  return (
    <Carousel
      items={mockItemsForCarousel}
      renderItem={(item) => (
        <WorkoutItem
          key={item.id}
          type={WorkoutItemVariants.SMALL}
          title={item.label}
          backgroundImage={{
            image: item.image.src,
          }}
        />
      )}
    />
  );
};

export default CarouselWorkoutsWrapper;
