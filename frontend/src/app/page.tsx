import { Banner, Carousel, ContainerSection } from "@/shared/ui";
import { TRAINING_PLANS, WORKOUTS_PLANS_URL } from "@/shared/constants";
import { mockItemsForCarousel } from "../data/mock";
import { WorkoutItem, WorkoutItemVariants } from "@/modules/workout";
import home_banner from "@/assets/home_banner.png";
import CarouselWorkoutsWrapper from "./CarouselWorkoutsWrapper";

const Home = async () => {
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
        <CarouselWorkoutsWrapper />
      </ContainerSection>
      <ContainerSection
        title="Планы тренировок"
        styles={{ marginTop: 64 }}
        contentStyles={{ display: "flex", gap: 109 }}
      >
        {TRAINING_PLANS.map((trainingPlan) => (
          <WorkoutItem
            key={trainingPlan.id}
            type={WorkoutItemVariants.LARGE_WITH_BUTTON}
            title={trainingPlan.label}
            backgroundImage={{
              image: trainingPlan.image.src,
            }}
            buttonLink={{
              href: `${WORKOUTS_PLANS_URL}/${trainingPlan.id}`,
              title: "Перейти",
            }}
          />
        ))}
      </ContainerSection>
    </div>
  );
};

export default Home;
