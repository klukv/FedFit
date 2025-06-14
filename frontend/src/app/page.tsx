"use client";

import { Banner, Carousel, ContainerSection } from "@/shared/ui";
import { TRAINING_PLANS } from "@/shared/constants";
import { mockItemsForCarousel } from "../data/mock";
import { WorkoutItem, WorkoutItemVariants } from "@/modules/workout";
import { useRouter } from "next/navigation";
import home_banner from "@/assets/home_banner.png";

export default function Home() {
  const router = useRouter();

  const routeToWorkoutsById = (id: number) => {
    router.push(`workouts_plans/${id}`);
  };

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
        <Carousel
          items={mockItemsForCarousel}
          renderItem={(item) => (
            <WorkoutItem
              key={item.id}
              type={WorkoutItemVariants.SMALL}
              title={item.label}
              backgroundImage={{
                image: item.image.src,
              }}
            />
          )}
        />
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
            button={{
              onClickButtonLink: () => routeToWorkoutsById(trainingPlan.id),
              title: "Перейти",
            }}
          />
        ))}
      </ContainerSection>
    </div>
  );
}
