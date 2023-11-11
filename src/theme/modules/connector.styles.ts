import { createStyles } from "@mantine/core";

export const useConnectorStyles = createStyles((theme) => ({
  wrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.sm,
    textAlign: "center",
  },
}));
