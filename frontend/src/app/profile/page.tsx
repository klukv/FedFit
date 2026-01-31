import { Card } from "@/shared/ui";
import { CardTypes } from "@/shared/types";
import { UserDataSection, ActivitySection, getProfile } from "@/modules/Profile";
import {
  mockItemsForCarousel,
  mockActivityData,
} from "../../data/mock";
import CarouselWorkoutsClientWrapper from "../CarouselWorkoutsWrapper";
import avatar from "@/assets/mock_avatar.png";
import "./_styles/profile.css";

const Page = async () => {
  const profileData = await getProfile();

  return (
    <div className="profile">
      <Card type={CardTypes.Section} title="Мои данные">
        <UserDataSection
          avatar={{ image: avatar }}
          initialValues={profileData}
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
        <CarouselWorkoutsClientWrapper items={mockItemsForCarousel} />
      </Card>
    </div>
  );
};

export default Page;
