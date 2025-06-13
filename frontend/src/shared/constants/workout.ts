import STRETCHING_TRAINING from "@/assets/workout/stretching_training.png";
import CARDIO_TRAINING from "@/assets/workout/cardio_training.png";
import STRENGTH_TRAINING from "@/assets/workout/strength_training.png";

export const TRAINING_PLANS = [
  {
    id: 0,
    label: "Силовые тренировки",
    image: STRENGTH_TRAINING,
    value: "strength",
  },
  {
    id: 1,
    label: "Кардио тренировки",
    image: CARDIO_TRAINING,
    value: "cardio",
  },
  {
    id: 2,
    label: "Растяжка",
    image: STRETCHING_TRAINING,
    value: "stretching",
  },
];
