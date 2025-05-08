import { Banner } from "@/libs/ui";
import home_banner from "@/assets/home_banner.png";

export default function Home() {
  return (
    <div>
      <Banner
        banner={{
          image: home_banner.src,
          height: 710
        }}
        title="Стань лучшей версией себя уже сегодня!"
        description="Преодолей свои границы, укрепи тело и дух вместе с нами. Начни путь к здоровью и энергии прямо сейчас!"
      />
    </div>
  );
}
