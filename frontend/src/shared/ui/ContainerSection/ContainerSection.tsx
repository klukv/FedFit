"use client";

import React, { CSSProperties, PropsWithChildren } from "react";
import { Montserrat } from "next/font/google";
import { clsx } from "clsx";
import "./containerSection.css";

interface IProps {
  title?: string;
  styles?: CSSProperties;
  contentStyles?: CSSProperties;
  placement?: "start" | "center" | "end";
}

const montserrat = Montserrat({
  subsets: ["latin"],
});

const SectionWithTitle = ({
  title,
  children,
  styles,
  contentStyles,
  placement = "start",
}: PropsWithChildren<IProps>) => {
  return (
    <section
      className={clsx("container-section container__app", {
        "container-section__center": placement === "center",
        "container-section__end": placement === "end",
      })}
      style={styles}
    >
      {title && (
        <h2 className={clsx("container-section__title", montserrat.className)}>
          {title}
        </h2>
      )}
      <div style={contentStyles}>{children}</div>
    </section>
  );
};

export default SectionWithTitle;
