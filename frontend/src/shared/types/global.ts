import { StaticImageData } from "next/image";

export type StaticImageProps = {
  image: StaticImageData | string;
  width?: number;
  height?: number;
};

export enum HOST_VARIANTS {
  Default = "Default",
  Without_prefix_api = "Without_prefix_api",
}