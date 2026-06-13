import { Banner, ContainerSection } from "@/shared/ui";
import { WorkoutService } from "@/modules/workout";
import home_banner from "@/assets/home_banner.png";
import CarouselWorkoutsClientWrapper from "./CarouselWorkoutsWrapper";
import CarouselTrainingPlansWrapper from "./CarouselTrainingPlansWrapper";
import PersonalTrainingPlansSection from "./PersonalTrainingPlansSection";

const CURRENT_USER_ID = 1;

const Home = async () => {
  const workoutService = new WorkoutService();

  const [workouts, personalTrainingPlans, trainingPlans] = await Promise.all([
    workoutService.getWorkouts(),
    workoutService.getPersonalTrainingPlans(CURRENT_USER_ID),
    workoutService.getTrainingPlans(),
  ]);

  return (
    <div
      style={{
        margin: "-10px -15px 54px -15px",
      }}
    >
      <Banner
        banner={{
          image: home_banner.src,
          height: 710,
        }}
        title="Стань лучшей версией себя уже сегодня!"
        description="Преодолей свои границы, укрепи тело и дух вместе с нами. Начни путь к здоровью и энергии прямо сейчас!"
      />
      <ContainerSection title="Тренировки" styles={{ marginTop: 64 }}>
        <CarouselWorkoutsClientWrapper items={workouts} />
      </ContainerSection>
      <ContainerSection
        title="Ваши личные планы тренировок"
        styles={{ marginTop: 64 }}
        contentStyles={{ gap: 20 }}
      >
        <PersonalTrainingPlansSection items={personalTrainingPlans} />
      </ContainerSection>
      <ContainerSection
        title="Планы тренировок"
        styles={{ marginTop: 64 }}
        contentStyles={{ gap: 20 }}
      >
        <CarouselTrainingPlansWrapper items={trainingPlans} />
      </ContainerSection>
    </div>
  );
};

export default Home;
