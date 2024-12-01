import { Box } from "@mantine/core";
import BrandLoader, { BrandLoaderProps } from "./LogoLoader";

export default function ContainedLoader(props: Readonly<BrandLoaderProps>) {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <BrandLoader {...props} />
    </Box>
  );
}
