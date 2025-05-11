"use client";

import { Banner, Carousel, ContainerSection } from "@/libs/ui";
import home_banner from "@/assets/home_banner.png";
import { mockItemsForCarousel } from "../data/mock";
import { WorkoutItem, WorkoutItemVariants } from "@/modules/Workout";

export default function Home() {
  return (
    <div>
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
              type={WorkoutItemVariants.SMALL}
              title={item.label}
              backgroundImage={{
                image: item.image.src,
              }}
            />
          )}
        />
      </ContainerSection>
    </div>
  );
}
