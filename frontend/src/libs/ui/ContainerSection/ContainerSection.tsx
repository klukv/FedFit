import React, { CSSProperties, PropsWithChildren } from "react";
import "./containerSection.css";
import { Montserrat } from "next/font/google";
import { clsx } from "clsx";

interface IProps {
  title?: string;
  styles?: CSSProperties;
}

const montserrat = Montserrat({
  subsets: ["latin"],
});

const SectionWithTitle = ({
  title,
  children,
  styles,
}: PropsWithChildren<IProps>) => {
  return (
    <section className="container-section container__app" style={styles}>
      {title && (
        <h2 className={clsx("container-section__title", montserrat.className)}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
};

export default SectionWithTitle;
