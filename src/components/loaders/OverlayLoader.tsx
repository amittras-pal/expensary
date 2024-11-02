import { LoadingOverlay, LoadingOverlayProps } from "@mantine/core";
import LogoLoader from "./LogoLoader";

export default function OverlayLoader(props: Readonly<LoadingOverlayProps>) {
  return (
    <LoadingOverlay
      {...props}
      overlayBlur={5}
      transitionDuration={100}
      loader={LogoLoader({ size: 250 })}
    />
  );
}
