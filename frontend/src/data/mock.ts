import arms from "@/assets/workout/arms.png";
import bike from "@/assets/workout/bike.png";
import foots from "@/assets/workout/foots.png";
import press from "@/assets/workout/press.png";
import run from "@/assets/workout/run.png";
import { WorkoutDetail } from "@/modules/workout";

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

// Mock данные для детальной страницы тренировки
export const mockWorkoutDetail: WorkoutDetail = {
  id: 1,
  name: "Силовой микс для развития выносливости",
  description: "Комплексная тренировка для развития силы и выносливости",
  exercisesCount: 7,
  duration: 40,
  level: "Средний",
  caloriesMin: 530,
  caloriesMax: 720,
  exercises: [
    {
      id: 1,
      name: "Разминка",
      description: "Разминка — 7 минут (кардио + суставная гимнастика)",
      duration: 420, // 7 минут в секундах
    },
    {
      id: 2,
      name: "Приседания",
      description: "Приседания — 3 подхода по 15 раз",
      sets: 3,
      reps: 15,
    },
    {
      id: 3,
      name: "Отжимания",
      description: "Отжимания — 3 подхода по 12 раз",
      sets: 3,
      reps: 12,
    },
    {
      id: 4,
      name: "Планка",
      description: "Планка - 3 подхода по 40 сек",
      sets: 3,
      duration: 40,
    },
    {
      id: 5,
      name: "Выпады вперед",
      description: "Выпады вперед - 3 подхода по 12 раз на каждую ногу",
      sets: 3,
      reps: 12,
    },
    {
      id: 6,
      name: "Тяга с утяжелением к поясу",
      description: "Тяга с утяжелением к поясу - 3 подхода по 12 раз",
      sets: 3,
      reps: 12,
    },
    {
      id: 7,
      name: "Берпи",
      description: "Берпи - 3 подхода по 10 раз",
      sets: 3,
      reps: 10,
    },
  ],
};
