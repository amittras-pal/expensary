import { createStyles } from "@mantine/core";

export const useCategoryFilterStyles = createStyles((theme) => ({
  wrapper: {
    border: `1px solid ${theme.colors.gray[8]}`,
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.md,
    maxWidth: 310,
    width: 240,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.dark[5],
    color: theme.colors.gray[2],
  },
  selectionGroup: {
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
}));
