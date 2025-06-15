import { StaticImageProps } from "@/shared/types";
import { MouseEventHandler } from "react";

export enum WorkoutItemVariants {
  SMALL = "SMALL",
  LARGE_WITH_BUTTON = "LARGE_WITH_BUTTON",
}

interface WorkoutItemBase {
  type: WorkoutItemVariants;
  title: string;
  backgroundImage: StaticImageProps;
}

interface WorkoutItemSmall extends WorkoutItemBase {
  type: WorkoutItemVariants.SMALL;
}

interface WorkoutItemLarge extends WorkoutItemBase {
  type: WorkoutItemVariants.LARGE_WITH_BUTTON;
  buttonLink: {
    href: string;
    title: string;
  };
}

export type WorkoutItemProps = WorkoutItemSmall | WorkoutItemLarge;
