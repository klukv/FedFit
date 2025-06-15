import React, { PropsWithChildren } from "react";
import { CardTypes } from "@/shared/types";
import clsx from "clsx";

interface IProps {
  type: CardTypes;
  background?: string;
  className?: string;
}

const CardWrapper = (props: PropsWithChildren<IProps>) => {
  return props.type === CardTypes.Section ? (
    <section
      className={clsx("card", props.className)}
      style={{
        backgroundColor: props.background ?? "var(--background-secondary)",
      }}
    >
      {props.children}
    </section>
  ) : (
    <div
      className={clsx("card", props.className)}
      style={{
        backgroundColor: props.background ?? "var(--background-secondary)",
      }}
    >
      {props.children}
    </div>
  );
};

export default CardWrapper;
