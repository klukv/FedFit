import { ButtonLinkVariants } from "@/shared/types";
import clsx from "clsx";

export const createClassnamesButtonLink = (
  variant: ButtonLinkVariants = "default",
) => {
  return clsx("button", {
    "button-default": variant === "default",
    "button-secondary": variant === "secondary",
  });
};
