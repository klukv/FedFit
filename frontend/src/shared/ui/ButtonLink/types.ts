import { MouseEventHandler, ReactNode } from "react";
import { ButtonLinkTypes, ButtonLinkVariants } from "@/shared/types";

interface ButtonLinkPropsBase {
  type: ButtonLinkTypes;
  title: string;
  variant?: ButtonLinkVariants;
  /** Иконка слева от текста (для кнопок и ссылок) */
  icon?: ReactNode;
  /** Aria-label для доступности (переопределяет доступное имя по умолчанию) */
  "aria-label"?: string;
}

export interface ButtonProps extends ButtonLinkPropsBase {
  type: ButtonLinkTypes.Button;
  onClickHandler: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  /** Тип кнопки для использования внутри формы (submit — отправка по Enter) */
  buttonType?: "button" | "submit";
  /** Состояние загрузки: показывается анимация спиннера, кнопка disabled */
  loading?: boolean;
  /** ID формы, которую кнопка отправляет (для type="submit" вне формы) */
  form?: string;
}

interface LinkProps extends ButtonLinkPropsBase {
  type: ButtonLinkTypes.Link;
  href: string;
}

export type ButtonLinkProps = ButtonProps | LinkProps;
