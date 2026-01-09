"use client"

import { clsx } from 'clsx';
import { Montserrat } from "next/font/google";
import { AchievementModel } from '../types'
import "./Achievement.css";

const montserrat = Montserrat({
  subsets: ["latin"],
});

interface IProps {
  achievement: AchievementModel;
}

const Achievement = (props: IProps) => {
  return (
    <div className="achievement">
      <div className="achievement__inner">
          <div className="achievement__icon" dangerouslySetInnerHTML={{ __html: props.achievement.icon }}></div>
          <div className={clsx("achievement__info", montserrat.className)}>
            <div className="achievement__info-number-value">{props.achievement.value}</div>
            <div className="achievement__info-text-value">{props.achievement.text}</div>
          </div>
      </div>
    </div>
  )
}

export default Achievement