"use client";

import React from "react";
import { default as CarouselLib } from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "./carousel.css";

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 7,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 5,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

interface IProps<Item> {
  items: Item[];
  renderItem: (item: Item) => React.JSX.Element;
}

const Carousel = <Item,>({ items, renderItem }: IProps<Item>) => {
  return (
    <CarouselLib
      responsive={responsive}
      sliderClass="container__carousel"
      itemClass="carousel__item"
    >
      {items.map((item) => renderItem(item))}
    </CarouselLib>
  );
};

export default Carousel;
