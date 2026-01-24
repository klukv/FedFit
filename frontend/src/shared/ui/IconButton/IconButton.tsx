"use client";

import { ReactNode, MouseEventHandler } from "react";
import "./iconButton.css";

export interface IconButtonProps {
  icon: ReactNode;
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  className?: string;
}

const IconButton = ({
  icon,
  label,
  onClick,
  ariaLabel,
  className = "",
}: IconButtonProps) => {
  return (
    <button
      type="button"
      className={`icon-button ${className}`.trim()}
      onClick={onClick}
      aria-label={ariaLabel || label}
    >
      <div className="icon-button__circle">
        <span className="icon-button__icon" aria-hidden="true">
          {icon}
        </span>
      </div>
      <span className="icon-button__label">{label}</span>
    </button>
  );
};

export default IconButton;
