import { Box, Text, ThemeIcon } from "@mantine/core";
import { IconTemplate } from "@tabler/icons-react";
import { primaryColor } from "../../../constants/app";
import React from "react";
import { NoDataOverlayProps } from "../interfaces";

export function NoDataOverlay(props: NoDataOverlayProps) {
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
      <Text
        ta="center"
        sx={(theme) => ({ color: theme.colors[primaryColor][4] })}
      >
        {props.message}
      </Text>
    </Box>
  );
}
