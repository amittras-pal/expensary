import { LoadingOverlay, LoadingOverlayProps } from "@mantine/core";
import BrandLoader from "./LogoLoader";

export default function OverlayLoader(props: Readonly<LoadingOverlayProps>) {
  return (
    <LoadingOverlay
      {...props}
      overlayProps={{ blur: 5 }}
      loaderProps={{ children: <BrandLoader size={250} /> }}
    />
  );
}
