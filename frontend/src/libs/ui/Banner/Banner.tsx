import React from "react";
import { StaticImageProps } from "@/types/global";
import "./banner.css";

interface IProps {
  banner: StaticImageProps;
  title?: string;
  description?: string;
}

const Banner = ({ banner, title, description }: IProps) => {
  return (
    <section
      className="banner"
      style={{
        backgroundSize: "cover",
        backgroundImage: `url('${banner.image}')`,
        width: banner.width ?? "100%",
        height: banner.height ?? "100%",
      }}
    >
      <div className="banner__header">
        <h1 className="banner_title">{title}</h1>
        <p className="banner__description">{description}</p>
      </div>
    </section>
  );
};

export default Banner;
