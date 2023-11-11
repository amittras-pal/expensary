import { createStyles } from "@mantine/core";

export const usePlanStyles = createStyles((theme) => ({
  wrapper: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    borderRadius: theme.radius.sm,
    padding: theme.spacing.xs,
    backgroundColor: theme.colors.dark[6],
  },
  details: {
    display: "flex",
    gap: theme.spacing.xs,
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
}));

export const usePlanExpensesStyles = createStyles(() => ({
  wrapper: {
    position: "fixed",
    width: "100%",
    maxWidth: "100%",
    top: "10px",
    display: "flex",
    justifyContent: "center",
    zIndex: 1000,
  },
}));
