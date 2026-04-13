import { Card } from "@/shared/ui";
import { CardTypes } from "@/shared/types";
import { UserDataSection, ActivitySection, ProfileService } from "@/modules/profile";
import { mockActivityData } from "../../data/mock";
import avatar from "@/assets/mock_avatar.png";
import "./_styles/profile.css";
import { HistoryWorkoutsList } from "@/modules/history";

const Page = async () => {
  const profileService = new ProfileService();

  const data = await profileService.getProfile();

  return (
    <div className="profile">
      <Card type={CardTypes.Section} title="Мои данные">
        <UserDataSection
          avatar={{ image: avatar }}
          initialValues={data}
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
        <HistoryWorkoutsList userId={1} />
      </Card>
    </div>
  );
};

export default Page;
