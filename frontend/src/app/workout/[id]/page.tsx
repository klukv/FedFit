import { WorkoutService, WorkoutPageContent, workoutCaloriesService } from "@/modules/workout";
import InfoCard from "@/modules/workout/ui/InfoCard";
import ExerciseList from "@/modules/workout/ui/ExerciseList";
import { ProfileService } from "@/modules/profile";
import { historyService } from "@/modules/history";
import { mapHistoryToWorkoutExecutionInitialState } from "@/modules/history/utils";
import type { WorkoutExecutionInitialState } from "@/modules/workout/types";
import { Montserrat } from "next/font/google";
import { notFound } from "next/navigation";
import Image from "next/image";
import arms_train_mock from "@/assets/workout/arms.png";
import "./_styles/workout-detail.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600"],
});

type IProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const getQueryValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const WorkoutDetailPage = async ({ params, searchParams }: IProps) => {
  const { id } = await params;
  const workoutId = Number(id);
  const search = (await searchParams) ?? {};

  const isCompleted = getQueryValue(search.isCompleted) === "true";
  const sourceParam = getQueryValue(search.source);
  const source: "history" | "plan" = sourceParam === "history" ? "history" : "plan";
  const historyIdParam = Number(getQueryValue(search.historyId));
  const workoutHistoryId = Number.isNaN(historyIdParam) ? undefined : historyIdParam;

  const workoutService = new WorkoutService();

  // TODO: Временный API-вызов на странице. После внедрения Redux получать тренировку из store.
  const workoutDetail = await workoutService.getWorkoutDetailById(workoutId);

  if (!workoutDetail) notFound();

  let initialExecutionState: WorkoutExecutionInitialState | undefined;

  if (!isCompleted) {
    // TODO: Временный API-вызов на странице. После внедрения Redux брать историю из store.
    const historyItem = source === "history" && workoutHistoryId
      ? (await historyService.getHistoryWorkouts(1)).find(
        (item) => item.workoutForHistory.id === workoutHistoryId,
      ) ?? null
      : await historyService.getLatestUnfinishedWorkoutHistoryByWorkoutId(1, workoutId);

    if (historyItem) initialExecutionState = mapHistoryToWorkoutExecutionInitialState(historyItem);
  }

  const profileService = new ProfileService();
  // TODO: Временный API-вызов на странице. После внедрения Redux получать профиль из store.
  const profile = await profileService.getProfile();
  const calorieUser = workoutCaloriesService.mapUserProfileToWorkoutCalorieUser(profile);

  return (
    <div className="workout-detail-page container__app">
      {/* Контент страницы с таймером и управлением тренировкой */}
      <WorkoutPageContent
        workoutId={workoutDetail.id}
        exercises={workoutDetail.exercises}
        workoutLevel={workoutDetail.level}
        calorieUser={calorieUser ?? undefined}
        initialExecutionState={initialExecutionState}
        source={source}
        workoutHistoryId={workoutHistoryId}
        exerciseList={<ExerciseList exercises={workoutDetail.exercises} />}
        infoBlock={
        <div className="workout-detail-page__info">
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
