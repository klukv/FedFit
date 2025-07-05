import { Card } from "@/shared/ui";
import { CardTypes } from "@/shared/types";
import { Achievement, AchievementService } from "@/modules/achievement";
import { WorkoutService } from "@/modules/workout";
import { mockItemsForCarousel } from "../../data/mock";
import CarouselWorkoutsClientWrapper from "../CarouselWorkoutsWrapper";
import "./_styles/profile.css";


const Page = async () => {
  const achievementService = new AchievementService();
  const workoutService = new WorkoutService();
  const achievementsResponse = achievementService.getAllAchievementsByUser(1);
  // TODO раскомментировать когда появится api
  //const historyWorkoutsResponse = workoutService.getHistoryWorkouts(1);

  const [achievements] = await Promise.all([achievementsResponse]);

  return (
    <div className="profile">
      <Card type={CardTypes.Section} title="Мои данные">
        <div>Туда сюда</div>
      </Card>
      <Card type={CardTypes.Section} title="Моя активность" contentClassName="achievements">
        {
          achievements.map(achievement => (
            <Achievement key={achievement.id} achievement={achievement} />
          ))
        }
      </Card>
      <Card type={CardTypes.Section} title="История тренировок">
        <CarouselWorkoutsClientWrapper items={mockItemsForCarousel} />
      </Card>
    </div>
  );
};

export default Page;
