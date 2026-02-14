import { WorkoutService } from "@/modules/Workout";
import InfoCard from "@/modules/Workout/ui/InfoCard";
import ExerciseList from "@/modules/Workout/ui/ExerciseList";
import { Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import WorkoutPageContent from "./WorkoutPageContent";
import Image from "next/image";
import arms_train_mock from "@/assets/workout/arms.png";
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

  const workoutDetail = await workoutService.getWorkoutDetailById(Number(id));

  if (!workoutDetail) notFound();

  return (
    <div className="workout-detail-page container__app">
      {/* Контент страницы с таймером и управлением тренировкой */}
      <WorkoutPageContent
        workoutId={workoutDetail.id}
        exerciseList={<ExerciseList exercises={workoutDetail.exercises} />}
        infoBlock={<div className="workout-detail-page__info">
          <div className="workout-detail-page__image-container">
            <Image
              className="workout-detail-page__image"
              src={arms_train_mock}
              alt={`Тренировка`}
              width={225}
              height={225}
            />
          </div>
          <div className="workout-detail-page__header-info-container">
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
          </div>
        </div>}
      />
    </div>
  );
};

export default WorkoutDetailPage;
