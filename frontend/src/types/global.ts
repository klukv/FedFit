import { StaticImageData } from "next/image";

export type StaticImageProps = {
  image: StaticImageData | string;
  width?: number;
  height?: number;
};
