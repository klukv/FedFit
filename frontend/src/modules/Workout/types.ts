import { StaticImageProps } from "@/types/global";

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
  button: {
    onClickButtonLink: () => void;
    title: string;
  };
}

export type WorkoutItemProps = WorkoutItemSmall | WorkoutItemLarge;
