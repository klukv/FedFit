"use client";

import { clsx } from "clsx";
import { Montserrat } from "next/font/google";
import { AchievementModel } from "../types";
import { getAchievementIconByCode } from "../utils/achievementIcons";
import "./Achievement.css";

const montserrat = Montserrat({
  subsets: ["latin"],
});

interface IProps {
  achievement: AchievementModel;
}

const Achievement = (props: IProps) => {
  const isLocked = props.achievement.unlocked === false;
  const Icon = getAchievementIconByCode(props.achievement.code);

  return (
    <div
      className={clsx("achievement", { "achievement--locked": isLocked })}
      aria-label={props.achievement.title}
    >
      <div className="achievement__inner">
        <div className="achievement__icon" aria-hidden="true">
          <Icon />
        </div>
        <div className={clsx("achievement__info", montserrat.className)}>
          <div className="achievement__info-number-value">
            {props.achievement.value}
          </div>
          <div className="achievement__info-text-value">
            {props.achievement.text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Achievement;
