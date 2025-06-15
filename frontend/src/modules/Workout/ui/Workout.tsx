"use client";

import React from "react";
import { WorkoutItemProps, WorkoutItemVariants } from "../types";
import { ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";

import clsx from "clsx";
import "./Workout.css";

const Workout = (props: WorkoutItemProps) => {
  return (
    <div
      className={clsx("workout-item", {
        "workout-item-large":
          props.type === WorkoutItemVariants.LARGE_WITH_BUTTON,
        "workout-item-small": props.type === WorkoutItemVariants.SMALL,
      })}
      style={{
        background: `url('${props.backgroundImage.image}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
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
