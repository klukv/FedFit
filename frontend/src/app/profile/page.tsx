import { Card } from "@/shared/ui";
import { CardTypes } from "@/shared/types";
import { UserDataSection, ActivitySection } from "@/modules/Profile";
// TODO: раскомментировать, когда появится бекенд
// import { AchievementService } from "@/modules/achievement";
// import { WorkoutService } from "@/modules/workout";
import {
  mockItemsForCarousel,
  mockUserData,
  mockActivityData,
} from "../../data/mock";
import CarouselWorkoutsClientWrapper from "../CarouselWorkoutsWrapper";
import avatar from "@/assets/mock_avatar.png";
import "./_styles/profile.css";

const Page = async () => {
  // TODO: раскомментировать, когда появится бекенд и перенести в модуль
  // const achievementService = new AchievementService();
  // const workoutService = new WorkoutService();
  // const achievementsResponse = achievementService.getAllAchievementsByUser(1);
  // const historyWorkoutsResponse = workoutService.getHistoryWorkouts(1);
  // const [achievements, historyWorkouts] = await Promise.all([
  //   achievementsResponse,
  //   historyWorkoutsResponse,
  // ]);

  return (
    <div className="profile">
      <Card type={CardTypes.Section} title="Мои данные">
        <UserDataSection
          avatar={{ image: avatar }}
          name={mockUserData.name}
          gender={mockUserData.gender}
          height={mockUserData.height}
          weight={mockUserData.weight}
          desiredWeight={mockUserData.desiredWeight}
        />
      </Card>
      <Card type={CardTypes.Section} title="Моя активность">
        <ActivitySection
          calories={mockActivityData.calories}
          workouts={mockActivityData.workouts}
          minutes={mockActivityData.minutes}
        />
      </Card>
      <Card type={CardTypes.Section} title="История тренировок">
        {/* TODO: раскомментировать, когда появится бекенд */}
        {/* <CarouselWorkoutsClientWrapper items={historyWorkouts} /> */}
        <CarouselWorkoutsClientWrapper items={mockItemsForCarousel} />
      </Card>
    </div>
  );
};

export default Page;
