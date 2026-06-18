import { Card } from "@/shared/ui";
import { CardTypes } from "@/shared/types";
import { UserDataSection, ProfileActivitySection, ProfileService } from "@/modules/profile";
import avatar from "@/assets/default_avatar.png";
import "./_styles/profile.css";
import { HistoryWorkoutsList } from "@/modules/history";

const USER_ID = 1;

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
        <ProfileActivitySection userId={USER_ID} />
      </Card>
      <Card type={CardTypes.Section} title="История тренировок">
        <HistoryWorkoutsList userId={USER_ID} />
      </Card>
    </div>
  );
};

export default Page;
