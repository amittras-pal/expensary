import { Box } from "@mantine/core";
import LogoLoader, { LogoLoaderProps } from "./LogoLoader";

export default function ContainedLoader(props: Readonly<LogoLoaderProps>) {
  return (
    <Box
      sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
    >
      <LogoLoader {...props} />
    </Box>
  );
}
