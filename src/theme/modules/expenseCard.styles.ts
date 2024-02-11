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
  highlight: {
    fontWeight: "bold",
    color: theme.colors[theme.primaryColor][2],
    backgroundColor: theme.fn.rgba(theme.colors[theme.primaryColor][9], 0.4),
    borderRadius: theme.radius.xs,
  },
}));
