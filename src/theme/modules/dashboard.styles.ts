import { createStyles } from "@mantine/core";

export const useDashboardStyles = createStyles((theme) => {
  return {
    budgetWrapper: {
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.dark[6],
      boxShadow: theme.shadows.md,
      padding: theme.spacing.sm,
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    listWrapper: {
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.dark[6],
      boxShadow: theme.shadows.md,
      padding: theme.spacing.sm,
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    noInfo: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.gray[8],
      height: "100%",
    },
    badge: {
      display: "flex",
      gap: theme.spacing.xs,
      alignItems: "center",
      marginRight: "auto",
    },
  };
});
