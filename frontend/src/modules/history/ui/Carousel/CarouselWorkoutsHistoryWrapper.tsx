"use client";

import { Carousel } from "@/shared/ui";
import { WorkoutHistory } from "../../types";
import { WorkoutHistoryItem } from "../WorkoutHistoryItem";

interface CarouselWorkoutsHistoryWrapperProps {
  items: WorkoutHistory[];
}

const CarouselWorkoutsHistoryWrapper = (props: CarouselWorkoutsHistoryWrapperProps) => {
  return (
    <Carousel
      items={props.items}
      renderItem={(item) => (
        <WorkoutHistoryItem key={item.workoutForHistory.id} item={item} />
      )}
    />
  );
};

export default CarouselWorkoutsHistoryWrapper;
