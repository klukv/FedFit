"use client";

import { Carousel } from "@/shared/ui";
import { WorkoutHistory } from "../../types";
import { WorkoutHistoryItem } from "../WorkoutHistoryItem";

interface IProps {
  items: WorkoutHistory[];
}

const CarouselWorkoutsHistoryWrapper = (props: IProps) => {
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
