"use client";

import { ReactNode, MouseEventHandler } from "react";
import clsx from "clsx";
import "./iconButton.css";

export interface IconButtonProps {
  icon: ReactNode;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  className?: string;
  /** `iconOnly` — компактная кнопка, текст только для скринридеров */
  variant?: "default" | "iconOnly";
  /** Подсказка при наведении */
  title?: string;
}

const IconButton = ({
  icon,
  label,
  onClick,
  ariaLabel,
  className = "",
  variant = "default",
  title,
}: IconButtonProps) => {
  const iconOnly = variant === "iconOnly";

  return (
    <button
      type="button"
      className={clsx("icon-button", iconOnly && "icon-button--icon-only", className)}
      onClick={onClick}
      aria-label={ariaLabel || label}
      title={title ?? (iconOnly ? label : undefined)}
    >
      <span className="icon-button__circle">
        <span className="icon-button__icon" aria-hidden="true">
          {icon}
        </span>
      </span>
      <span
        className={clsx(
          "icon-button__label",
          iconOnly && "icon-button__label--visually-hidden",
        )}
      >
        {label}
      </span>
    </button>
  );
};

export default IconButton;
