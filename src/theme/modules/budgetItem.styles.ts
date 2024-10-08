import { createStyles } from "@mantine/core";

export const useBudgetItemStyles = createStyles((theme) => ({
  item: {
    padding: 8,
    borderRadius: theme.radius.sm,
    boxShadow: theme.shadows.md,
    backgroundColor: theme.colors.dark[7],
    border: "1px solid transparent",
    transition: "all 1s ease-out",
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: 8,
    position: "relative",
  },
  elevate: {
    zIndex: 1,
  },
  share: {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    opacity: 0.1,
    borderRadius: theme.radius.sm,
    zIndex: 0,
  },
}));
