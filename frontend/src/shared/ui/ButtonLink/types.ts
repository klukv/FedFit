import { MouseEventHandler } from "react";
import { ButtonLinkTypes, ButtonLinkVariants } from "@/shared/types";

interface ButtonLinkPropsBase {
  type: ButtonLinkTypes;
  title: string;
  variant?: ButtonLinkVariants;
}

export interface ButtonProps extends ButtonLinkPropsBase {
  type: ButtonLinkTypes.Button;
  onClickHandler: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  /** Тип кнопки для использования внутри формы (submit — отправка по Enter) */
  buttonType?: "button" | "submit";
  /** Состояние загрузки: показывается анимация спиннера, кнопка disabled */
  loading?: boolean;
}

interface LinkProps extends ButtonLinkPropsBase {
  type: ButtonLinkTypes.Link;
  href: string;
}

export type ButtonLinkProps = ButtonProps | LinkProps;
