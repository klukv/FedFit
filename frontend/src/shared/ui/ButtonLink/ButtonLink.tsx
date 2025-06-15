"use client";

import React from "react";
import { ButtonLinkProps } from "./types";
import { createClassnamesButtonLink } from "./utils";
import { ButtonLinkTypes } from "@/shared/types";
import Link from "next/link";
import "./buttonLink.css";

const ButtonLink = (props: ButtonLinkProps) => {
  const classNames = createClassnamesButtonLink(props.variant);

  return props.type === ButtonLinkTypes.Button ? (
    <button className={classNames} onClick={props.onClickHandler}>
      {props.title}
    </button>
  ) : (
    <Link href={props.href} className={classNames}>
      {props.title}
    </Link>
  );
};

export default ButtonLink;
