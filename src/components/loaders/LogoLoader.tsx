import BrandLogo from "./logo-stroke.svg?react";
import "./LogoLoader.scss";

export type LogoLoaderProps = { size: number };

export default function LogoLoader(props: Readonly<LogoLoaderProps>) {
  return (
    <BrandLogo className="logo-loader" width={props.size} height={props.size} />
  );
}
