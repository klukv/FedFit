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
}

interface LinkProps extends ButtonLinkPropsBase {
  type: ButtonLinkTypes.Link;
  href: string;
}

export type ButtonLinkProps = ButtonProps | LinkProps;
