import BrandLogo from "./logo-stroke.svg?react";
import "./LogoLoader.scss";

export type BrandLoaderProps = { size: number; brand?: boolean };

export default function BrandLoader(props: Readonly<BrandLoaderProps>) {
  return (
    <BrandLogo
      className={`logo-loader ${props.brand ? " brand" : ""}`}
      width={props.size}
      height={props.size}
    />
  );
}
