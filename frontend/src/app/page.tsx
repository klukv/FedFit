import { Banner, ContainerSection } from "@/shared/ui";
import { TRAINING_PLANS, TRAINING_PLANS_URL } from "@/shared/constants";
import { WorkoutItem, WorkoutItemVariants, WorkoutService } from "@/modules/Workout";
import { mockItemsForCarousel } from "../data/mock";
import home_banner from "@/assets/home_banner.png";
import CarouselWorkoutsClientWrapper from "./CarouselWorkoutsWrapper";

const Home = async () => {
  const workoutService = new WorkoutService();
  const trainingPlans = await workoutService.getTrainingPlans();

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
      <ContainerSection title="Рекомендуем Вам" styles={{ marginTop: 64 }}>
        <CarouselWorkoutsClientWrapper items={mockItemsForCarousel} />
      </ContainerSection>
      <ContainerSection
        title="Планы тренировок"
        styles={{ marginTop: 64 }}
        contentStyles={{ display: "flex", gap: 109 }}
      >
        {trainingPlans.map((trainingPlan, idx) => (
          <WorkoutItem
            key={trainingPlan.id}
            type={WorkoutItemVariants.LARGE_WITH_BUTTON}
            title={trainingPlan.name}
            backgroundImage={{
              image: TRAINING_PLANS[idx].image.src,
            }}
            buttonLink={{
              href: `${TRAINING_PLANS_URL}/${trainingPlan.id}`,
              title: "Перейти",
            }}
          />
        ))}
      </ContainerSection>
    </div>
  );
};

export default Home;
