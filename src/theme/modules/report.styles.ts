import { createStyles } from "@mantine/core";

export const useReportStyles = createStyles((theme) => ({
  wrapper: {
    borderRadius: theme.radius.md,
    boxShadow: theme.shadows.lg,
    border: "1px solid",
    borderColor: theme.colors.gray[8],
    padding: theme.spacing.md,
  },
}));
