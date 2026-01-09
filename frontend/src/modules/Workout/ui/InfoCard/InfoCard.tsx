"use client";

import React from "react";
import { Roboto } from "next/font/google";
import clsx from "clsx";
import "./infoCard.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400"],
});

interface InfoCardProps {
  title: string;
  subtitle?: string;
  gradient: "primary" | "secondary" | "tertiary";
}

const InfoCard = ({ title, subtitle, gradient }: InfoCardProps) => {
  return (
    <div
      className={clsx("info-card", `info-card--${gradient}`)}
      role="region"
      aria-label={title}
    >
      <div className={clsx("info-card__content", roboto.className)}>
        <div className="info-card__title">{title}</div>
        {subtitle && <div className="info-card__subtitle">{subtitle}</div>}
      </div>
    </div>
  );
};

export default InfoCard;

