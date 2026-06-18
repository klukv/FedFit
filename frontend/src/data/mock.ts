import { getWorkoutImage } from "@/modules/workout/utils/workoutImages";
export const mockItemsForCarousel = [
  {
    id: 0,
    name: "Тренировка на руки",
    image: getWorkoutImage({ id: 0, name: "Тренировка на руки", value: "upper-dumbbells" }),
  },
  {
    id: 1,
    name: "Бег",
    image: getWorkoutImage({ id: 1, name: "Бег", value: "endurance-long" }),
  },
  {
    id: 2,
    name: "Велотренировка",
    image: getWorkoutImage({ id: 2, name: "Велотренировка", value: "cardio-45" }),
  },
  {
    id: 3,
    name: "Тренировка на пресс",
    image: getWorkoutImage({ id: 3, name: "Тренировка на пресс", value: "core-short" }),
  },
  {
    id: 4,
    name: "Тренировка на ноги",
    image: getWorkoutImage({ id: 4, name: "Тренировка на ноги", value: "legs-glutes" }),
  },
];
