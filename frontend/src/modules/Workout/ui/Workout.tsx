"use client";

import { WorkoutItemProps, WorkoutItemVariants } from "../types";
import { ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";

import clsx from "clsx";
import "./Workout.css";

const Workout = (props: WorkoutItemProps) => {
  const imageSrc =
    typeof props.backgroundImage.image === "string"
      ? props.backgroundImage.image
      : props.backgroundImage.image.src;

  return (
    <div
      className={clsx("workout-item", {
        "workout-item-large":
          props.type === WorkoutItemVariants.LARGE_WITH_BUTTON,
        "workout-item-small": props.type === WorkoutItemVariants.SMALL,
      })}
    >
      {/* Нативный img без next/image — без повторного сжатия, вся фотография в кадре */}
      <img
        className="workout-item__image"
        src={imageSrc}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
      />
      <div className="workout-item__inner">
        <h3 className="workout-item__title">{props.title}</h3>
        {props.type === WorkoutItemVariants.LARGE_WITH_BUTTON && (
          <ButtonLink
            type={ButtonLinkTypes.Link}
            title={props.buttonLink.title}
            href={props.buttonLink.href}
          />
        )}
      </div>
    </div>
  );
};

export default Workout;
