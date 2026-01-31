"use client";

import React, { forwardRef } from "react";
import { ButtonLinkProps, ButtonProps } from "./types";
import { createClassnamesButtonLink } from "./utils";
import { ButtonLinkTypes } from "@/shared/types";
import Link from "next/link";
import { clsx } from "clsx";
import "./buttonLink.css";

const ButtonLink = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonLinkProps>(
  (props, ref) => {
    const classNames = createClassnamesButtonLink(props.variant);

    if (props.type === ButtonLinkTypes.Button) {
      const buttonProps = props as ButtonProps;
      const isLoading = buttonProps.loading ?? false;
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type={buttonProps.buttonType ?? "button"}
          form={buttonProps.form}
          className={clsx(classNames, { "button--loading": isLoading })}
          onClick={buttonProps.onClickHandler}
          disabled={buttonProps.disabled || isLoading}
          aria-busy={isLoading}
          aria-label={props["aria-label"]}
        >
          {props.icon && (
            <span className="button__icon" aria-hidden>
              {props.icon}
            </span>
          )}
          <span className="button__title">{props.title}</span>
          {isLoading && <span className="button__spinner" aria-hidden />}
        </button>
      );
    }

    return (
      <Link
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={props.href}
        className={classNames}
        aria-label={props["aria-label"]}
      >
        {props.icon && (
          <span className="button__icon" aria-hidden>
            {props.icon}
          </span>
        )}
        {props.title}
      </Link>
    );
  }
);

ButtonLink.displayName = "ButtonLink";

export default ButtonLink;
