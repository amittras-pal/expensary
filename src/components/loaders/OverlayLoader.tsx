import { LoadingOverlay, LoadingOverlayProps } from "@mantine/core";
import BrandLoader from "./LogoLoader";

export default function OverlayLoader(props: Readonly<LoadingOverlayProps>) {
  return (
    <LoadingOverlay
      {...props}
      overlayBlur={5}
      transitionDuration={100}
      loader={BrandLoader({ size: 250 })}
    />
  );
}
