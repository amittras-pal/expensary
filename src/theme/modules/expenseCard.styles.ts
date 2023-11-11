import { createStyles } from "@mantine/core";

export const useExpenseStyles = createStyles((theme) => ({
  wrapper: {
    height: "100%",
    border: `1px solid ${theme.colors.dark[4]}`,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.sm,
    transition: "all 0.25s ease-in-out",
    "&:not(:last-child)": {
      marginBottom: theme.spacing.xs,
    },
  },
}));
