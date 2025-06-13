import React, { CSSProperties, PropsWithChildren } from "react";
import { Montserrat } from "next/font/google";
import { clsx } from "clsx";
import "./containerSection.css";

interface IProps {
  title?: string;
  styles?: CSSProperties;
  contentStyles?: CSSProperties;
}

const montserrat = Montserrat({
  subsets: ["latin"],
});

const SectionWithTitle = ({
  title,
  children,
  styles,
  contentStyles,
}: PropsWithChildren<IProps>) => {
  return (
    <section className="container-section container__app" style={styles}>
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
