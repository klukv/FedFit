import React from "react";
import { Card } from "@/shared/ui";
import { CardTypes } from "@/shared/types";
import "./_styles/profile.css";

const Page = () => {
  return (
    <div className="profile">
      <Card type={CardTypes.Section} title="Мои данные">
        <div>Туда сюда</div>
      </Card>
      <Card type={CardTypes.Section} title="Моя активность">
        <div>Туда сюда 2</div>
      </Card>
      <Card type={CardTypes.Section} title="История тренировок">
        <div>А здесь уже не туда сюда</div>
      </Card>
    </div>
  );
};

export default Page;
