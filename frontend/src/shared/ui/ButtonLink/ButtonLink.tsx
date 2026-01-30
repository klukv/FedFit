"use client";

import React from "react";
import { ButtonLinkProps, ButtonProps } from "./types";
import { createClassnamesButtonLink } from "./utils";
import { ButtonLinkTypes } from "@/shared/types";
import Link from "next/link";
import { clsx } from "clsx";
import "./buttonLink.css";

const ButtonLink = (props: ButtonLinkProps) => {
  const classNames = createClassnamesButtonLink(props.variant);

  if (props.type === ButtonLinkTypes.Button) {
    const buttonProps = props as ButtonProps;
    const isLoading = buttonProps.loading ?? false;
    return (
      <button
        type={buttonProps.buttonType ?? "button"}
        className={clsx(classNames, { "button--loading": isLoading })}
        onClick={buttonProps.onClickHandler}
        disabled={buttonProps.disabled || isLoading}
        aria-busy={isLoading}
      >
        <span className="button__title">{props.title}</span>
        {isLoading && <span className="button__spinner" aria-hidden />}
      </button>
    );
  }

  return (
    <Link href={props.href} className={classNames}>
      {props.title}
    </Link>
  );
};

export default ButtonLink;
