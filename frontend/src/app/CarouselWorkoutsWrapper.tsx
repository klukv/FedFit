"use client";

import Link from "next/link";
import { Carousel } from "@/shared/ui";
import { WorkoutItem, WorkoutItemVariants, type Workout } from "@/modules/workout";
import { WORKOUT_CAROUSEL_IMAGES } from "@/shared/constants";

interface IProps {
  items: Pick<Workout, "id" | "name">[];
}

const CarouselWorkoutsClientWrapper = (props: IProps) => {
  return (
    <Carousel
      items={props.items}
      renderItem={(item, idx) => (
        <Link href={`/workout/${item.id}`} key={item.id} className="workout-carousel-link">
          <WorkoutItem
            type={WorkoutItemVariants.SMALL}
            title={item.name}
            backgroundImage={{
              image: WORKOUT_CAROUSEL_IMAGES[idx % WORKOUT_CAROUSEL_IMAGES.length].src,
            }}
          />
        </Link>
      )}
    />
  );
};

export default CarouselWorkoutsClientWrapper;
