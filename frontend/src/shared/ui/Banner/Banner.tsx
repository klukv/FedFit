import React, { CSSProperties } from "react";
import { Montserrat } from "next/font/google";
import { StaticImageProps } from "@/shared/types";
import clsx from "clsx";
import "./banner.css";

interface IProps {
  banner: StaticImageProps;
  title?: string;
  description?: string;
}

const montserrat = Montserrat({
  subsets: ["latin"],
});

const Banner = ({ banner, title, description }: IProps) => {
  return (
    <section
      className="banner"
      style={{
        backgroundSize: "cover",
        backgroundImage: `url('${banner.image}')`,
        width: banner.width ?? "100%",
        height: banner.height ?? "100%"
      }}
    >
      <div className={clsx("banner__header", montserrat.className)}>
        <h1 className="banner_title">{title}</h1>
        <p className="banner__description">{description}</p>
      </div>
    </section>
  );
};

export default Banner;
