"use client";

import React, { MouseEventHandler } from "react";
import { clsx } from "clsx";

import "./button.css";

interface IProps {
  title: string;
  onClickHandler: MouseEventHandler<HTMLButtonElement>;
  variant?: "default" | "secondary";
}

const Button = ({ variant = "default", title, onClickHandler }: IProps) => {
  return (
    <button
      type="button"
      className={clsx("button", {
        "button-default": variant === "default",
        "button-secondary": variant === "secondary",
      })}
      onClick={onClickHandler}
    >
      {title}
    </button>
  );
};

export default Button;
