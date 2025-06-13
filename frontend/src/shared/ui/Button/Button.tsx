import React from "react";
import "./button.css";
import { clsx } from "clsx";

interface IProps {
  title: string;
  onClickHandler: () => void;
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
