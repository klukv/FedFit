import React, { PropsWithChildren } from "react";
import CardWrapper from "./Wrapper";
import { CardTypes } from "@/shared/types";
import { Montserrat } from "next/font/google";
import clsx from "clsx";
import "./card.css";

interface IProps {
  type: CardTypes;
  title?: string;
  background?: string;
  wrapperClassName?: string;
  contentClassName?: string;
}

const montserrat = Montserrat({
  subsets: ["latin"],
});

const Card = (props: PropsWithChildren<IProps>) => {
  return (
    <CardWrapper
      type={props.type}
      className={props.wrapperClassName}
      background={props.background}
    >
      {props.title && (
        <h2 className={clsx("card__title", montserrat.className)}>
          {props.title}
        </h2>
      )}
      <div className={clsx("card__content", props.contentClassName)}>
        {props.children}
      </div>
    </CardWrapper>
  );
};

export default Card;
