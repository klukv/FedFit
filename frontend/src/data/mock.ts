import arms from "@/assets/workout/arms.png";
import bike from "@/assets/workout/bike.png";
import foots from "@/assets/workout/foots.png";
import press from "@/assets/workout/press.png";
import run from "@/assets/workout/run.png";

export const mockItemsForCarousel = [
  {
    id: 0,
    name: "Тренировка на руки",
    image: arms,
  },
  {
    id: 1,
    name: "Бег",
    image: run,
  },
  {
    id: 2,
    name: "Велотренировка",
    image: bike,
  },
  {
    id: 3,
    name: "Тренировка на пресс",
    image: press,
  },
  {
    id: 4,
    name: "Тренировка на ноги",
    image: foots,
  },
];

export const mockUserData = {
  name: "Юлия",
  gender: "Женский",
  height: 165,
  weight: 100,
  desiredWeight: 70,
};

export const mockActivityData = {
  calories: 589,
  workouts: 2,
  minutes: 116,
};
