"use client";

import React from "react";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { Montserrat, Roboto } from "next/font/google";
import clsx from "clsx";
import { ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";
import "./userDataSection.css";

const montserrat = Montserrat({
  subsets: ["latin"],
});

const roboto = Roboto({
  subsets: ["latin"],
});

interface UserDataFieldProps {
  label: string;
  value: string | number;
}

const UserDataField = ({ label, value }: UserDataFieldProps) => {
  return (
    <div className="user-data-field-container">
      <div className={clsx("user-data-field__label", roboto.className)}>
        {label}
      </div>
      <div className="user-data-field">
        <div className={clsx("user-data-field__value", roboto.className)}>
          {value}
        </div>
      </div>
    </div>
  );
};

interface UserDataSectionProps {
  avatar: { image: string | StaticImageData };
  name: string;
  gender: string;
  height: number;
  weight: number;
  desiredWeight: number;
}

const UserDataSection = (props: UserDataSectionProps) => {
  return (
    <div className="user-data-section" role="region" aria-label="Мои данные">
      <div className="user-data-section__edit-button">
        <ButtonLink
          type={ButtonLinkTypes.Button}
          title="Изменить"
          variant="default"
          onClickHandler={() => {
            // TODO: Implement edit functionality
          }}
        />
      </div>
      <div className="user-data-section__content">
        <div className="user-data-section__avatar-container">
          <div className="user-data-section__avatar-wrapper">
            <Image
              className="user-data-section__avatar"
              src={props.avatar.image}
              alt={`Аватар пользователя ${props.name}`}
              width={225}
              height={225}
            />
            <div
              className={clsx("user-data-section__name", montserrat.className)}
            >
              {props.name}
            </div>
            <ButtonLink
              type={ButtonLinkTypes.Button}
              title="Загрузить"
              variant="default"
              onClickHandler={() => {
                // TODO: Implement file upload
              }}
            />
          </div>
        </div>
        <div className="user-data-section__fields">
          <UserDataField label="Пол" value={props.gender} />
          <UserDataField label="Рост" value={props.height} />
          <UserDataField label="Вес" value={props.weight} />
          <UserDataField label="Желаемый вес" value={props.desiredWeight} />
        </div>
      </div>
    </div>
  );
};

export default UserDataSection;
