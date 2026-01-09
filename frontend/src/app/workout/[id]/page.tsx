import { WorkoutService } from "@/modules/Workout";
import InfoCard from "@/modules/Workout/ui/InfoCard";
import ExerciseList from "@/modules/Workout/ui/ExerciseList";
import { Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import StartWorkoutButtonClient from "./StartWorkoutButtonClient";
import "./_styles/workout-detail.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600"],
});

type IProps = {
  params: Promise<{ id: string }>;
};

const WorkoutDetailPage = async ({ params }: IProps) => {
  const { id } = await params;
  const workoutService = new WorkoutService();

  // TODO: Uncomment for production
  // const workoutDetail = await workoutService.getWorkoutDetailById(Number(id));
  
  // Mock data для разработки
  const { mockWorkoutDetail } = await import("@/data/mock");
  const workoutDetail = mockWorkoutDetail;
  
  // Используем переменные для избежания ошибок линтера
  void id;
  void workoutService;

  if (!workoutDetail) {
    notFound();
  }

  return (
    <div className="workout-detail-page">
      {/* Изображение тренировки */}
      <div className="workout-detail-page__image-container">
        {/* TODO: Заменить на реальное изображение из workoutDetail.image */}
        <div className="workout-detail-page__image-placeholder">
          История тренировок
        </div>
      </div>

      {/* Заголовок тренировки */}
      <div className="workout-detail-page__header">
        <h1 className={montserrat.className + " workout-detail-page__title"}>
          {workoutDetail.name}
        </h1>
      </div>

      {/* Информационные карточки */}
      <div className="workout-detail-page__info-cards">
        <InfoCard
          title={`${workoutDetail.exercisesCount}\nупражнений`}
          gradient="secondary"
        />
        <InfoCard
          title={`${workoutDetail.duration} минут\nвремя тренировки`}
          gradient="tertiary"
        />
        <InfoCard
          title={`${workoutDetail.level}\nуровень`}
          gradient="primary"
        />
        <InfoCard
          title={`${workoutDetail.caloriesMin} - ${workoutDetail.caloriesMax}\nкалорий`}
          gradient="primary"
        />
      </div>

      {/* Список упражнений */}
      <div className="workout-detail-page__exercises">
        <ExerciseList exercises={workoutDetail.exercises} />
      </div>

      {/* Кнопка начала тренировки */}
      <StartWorkoutButtonClient workoutId={workoutDetail.id} />
    </div>
  );
};

export default WorkoutDetailPage;

