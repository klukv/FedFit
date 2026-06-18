"use client";

import Link from "next/link";
import { Carousel } from "@/shared/ui";
import {
  WorkoutItem,
  WorkoutItemVariants,
  getWorkoutImageSrc,
  type Workout,
} from "@/modules/workout";

interface IProps {
  items: Pick<Workout, "id" | "name" | "value">[];
}

const CarouselWorkoutsClientWrapper = (props: IProps) => {
  return (
    <Carousel
      items={props.items}
      renderItem={(item) => (
        <Link href={`/workout/${item.id}`} key={item.id} className="workout-carousel-link">
          <WorkoutItem
            type={WorkoutItemVariants.SMALL}
            title={item.name}
            backgroundImage={{
              image: getWorkoutImageSrc(item),
            }}
          />
        </Link>
      )}
    />
  );
};

export default CarouselWorkoutsClientWrapper;
