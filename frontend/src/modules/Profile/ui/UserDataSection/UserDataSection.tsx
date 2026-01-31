"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { StaticImageData } from "next/image";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { Montserrat, Roboto } from "next/font/google";
import clsx from "clsx";
import { ButtonLink } from "@/shared/ui";
import { ButtonLinkTypes } from "@/shared/types";
import { ProfileFormField } from "./ProfileFormField";
import { PROFILE_FIELDS_CONFIG } from "@/modules/Profile/constants";
import { useProfileForm } from "@/modules/Profile/hooks";
import type { UserProfileFormData } from "@/modules/Profile/types";
import "./userDataSection.css";

const montserrat = Montserrat({ subsets: ["latin"] });
const roboto = Roboto({ subsets: ["latin"] });

interface UserDataFieldProps {
  label: string;
  value: string | number;
}

function UserDataField(props: UserDataFieldProps) {
  return (
    <div className="user-data-field-container">
      <div className={clsx("user-data-field__label", roboto.className)}>{props.label}</div>
      <div className="user-data-field">
        <div className={clsx("user-data-field__value", roboto.className)}>{props.value}</div>
      </div>
    </div>
  );
}

export interface UserDataSectionProps {
  avatar: { image: string | StaticImageData };
  initialValues: UserProfileFormData;
}

export default function UserDataSection(props: UserDataSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const editButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleSuccess = useCallback(() => setIsEditing(false), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    onSubmit,
    isSubmitting,
    saveError,
    setSaveError,
  } = useProfileForm(props.initialValues, handleSuccess);

  const handleEdit = useCallback(() => {
    setSaveError(null);
    setIsEditing(true);
  }, [setSaveError]);

  const handleCancel = useCallback(() => {
    reset(props.initialValues);
    setSaveError(null);
    setIsEditing(false);
    editButtonRef.current?.focus();
  }, [props.initialValues, reset, setSaveError]);

  useEffect(() => {
    if (isEditing) {
      firstFieldRef.current?.focus();
    }
  }, [isEditing]);

  const initialValues = props.initialValues;

  return (
    <div className="user-data-section" role="region" aria-label="Мои данные">
      <div className="user-data-section__actions">
        {!isEditing ? (
          <ButtonLink
            ref={editButtonRef}
            type={ButtonLinkTypes.Button}
            title="Изменить"
            variant="default"
            icon={<FiEdit2 />}
            onClickHandler={handleEdit}
            aria-label="Изменить данные профиля"
          />
        ) : (
          <>
            <ButtonLink
              type={ButtonLinkTypes.Button}
              title="Сохранить"
              variant="default"
              icon={<FiCheck />}
              buttonType="submit"
              form="profile-edit-form"
              onClickHandler={() => {}}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
            <ButtonLink
              type={ButtonLinkTypes.Button}
              title="Отменить"
              variant="tertiary"
              icon={<FiX />}
              onClickHandler={handleCancel}
              disabled={isSubmitting}
            />
          </>
        )}
      </div>

      <div className="user-data-section__content">
        {isEditing ? (
          <form
            id="profile-edit-form"
            className="user-data-section__form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="user-data-section__avatar-container">
              <div className="user-data-section__avatar-wrapper">
                <Image
                  className="user-data-section__avatar"
                  src={props.avatar.image}
                  alt={`Аватар пользователя ${initialValues.name}`}
                  width={225}
                  height={225}
                />
                <ButtonLink
                  type={ButtonLinkTypes.Button}
                  title="Загрузить"
                  variant="default"
                  onClickHandler={() => {}}
                />
              </div>
            </div>
            <div className="user-data-section__fields">
              {PROFILE_FIELDS_CONFIG.map((field) => (
                <ProfileFormField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type}
                  register={
                    field.valueAsNumber
                      ? register(field.name, { valueAsNumber: true })
                      : register(field.name)
                  }
                  error={errors[field.name]}
                  min={field.min}
                  max={field.max}
                  inputRef={field.name === "name" ? firstFieldRef : undefined}
                />
              ))}
            </div>
            {saveError && (
              <p className="user-data-section__form-error" role="alert">
                {saveError}
              </p>
            )}
          </form>
        ) : (
          <>
            <div className="user-data-section__avatar-container">
              <div className="user-data-section__avatar-wrapper">
                <Image
                  className="user-data-section__avatar"
                  src={props.avatar.image}
                  alt={`Аватар пользователя ${initialValues.name}`}
                  width={225}
                  height={225}
                />
                <div className={clsx("user-data-section__name", montserrat.className)}>
                  {initialValues.name}
                </div>
                <ButtonLink
                  type={ButtonLinkTypes.Button}
                  title="Загрузить"
                  variant="default"
                  onClickHandler={() => {}}
                />
              </div>
            </div>
            <div className="user-data-section__fields">
              <UserDataField label="Пол" value={initialValues.gender} />
              <UserDataField label="Рост" value={initialValues.height} />
              <UserDataField label="Вес" value={initialValues.weight} />
              <UserDataField label="Желаемый вес" value={initialValues.desiredWeight} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
