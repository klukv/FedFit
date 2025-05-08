import React from "react";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { StaticImageProps } from "@/types/global";
import "./header.css";
import clsx from "clsx";

interface IProps {
  logo: StaticImageProps;
  avatar: StaticImageProps;
  username: string;
}

const montserrat = Montserrat({
  subsets: ["latin"],
});

const Header = ({ avatar, logo, username }: IProps) => {
  return (
    <header className="header">
      <div className="header_inner container__app">
        <Image
          className="header__logo"
          width={logo.width ?? 230}
          height={logo.height ?? 70}
          src={logo.image}
          alt="Логотип"
        />
        <div className="header__profile">
          <div
            className={clsx("header__profile-username", montserrat.className)}
          >
            {username}
          </div>
          <Image
            className="header__profile-avatar"
            width={logo.width ?? 60}
            height={logo.height ?? 60}
            src={avatar.image}
            alt="Аватар"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
