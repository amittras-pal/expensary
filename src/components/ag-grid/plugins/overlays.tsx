import { Box, Text, ThemeIcon, useMantineTheme } from "@mantine/core";
import { IconTemplate } from "@tabler/icons-react";
import { NoDataOverlayProps } from "../interfaces";

export function NoDataOverlay(props: NoDataOverlayProps) {
  const { primaryColor } = useMantineTheme();
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        gap: "1.25rem",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ThemeIcon size={140} variant="light" radius="lg">
        <IconTemplate size={100} />
      </ThemeIcon>
      <Text ta="center" sx={() => ({ color: primaryColor[4] })}>
        {props.message}
      </Text>
    </Box>
  );
}
