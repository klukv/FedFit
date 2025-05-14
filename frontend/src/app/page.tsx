"use client";

import { Banner, Carousel, ContainerSection } from "@/libs/ui";
import { mockItemsForCarousel } from "../data/mock";
import { WorkoutItem, WorkoutItemVariants } from "@/modules/Workout";
import home_banner from "@/assets/home_banner.png";
import { TRAINING_PLANS } from "@/libs/constants";

export default function Home() {
  return (
    <div style={{
      marginBottom: 64
    }}>
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
        contentStyles={{ display: "flex", gap: 109 }}>
        {TRAINING_PLANS.map((trainingPlan) => (
          <WorkoutItem
            key={trainingPlan.id}
            type={WorkoutItemVariants.LARGE_WITH_BUTTON}
            title={trainingPlan.label}
            backgroundImage={{
              image: trainingPlan.image.src,
            }}
            button={{
              onClickButtonLink: () => console.log("click"),
              title: "Перейти"
            }}
          />
        ))}
      </ContainerSection>
    </div>
  );
}
