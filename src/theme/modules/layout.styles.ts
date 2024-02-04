import { createStyles } from "@mantine/core";

export const useAppStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "center",
    padding: theme.spacing.md,
    boxShadow: theme.shadows.sm,
  },
  navigation: {
    boxShadow: theme.shadows.sm,
  },
}));

export const useShortcutBlockStyles = createStyles((theme) => ({
  block: {
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  highlight: {
    backgroundColor: theme.colors.dark[8],
  },
}));

export const useNavBtnStyle = createStyles(
  (theme, { active }: { active: boolean }) => ({
    navBtn: {
      display: "block",
      width: "100%",
      padding: theme.spacing.xs,
      borderRadius: theme.radius.sm,
      marginBottom: theme.spacing.sm,
      color: theme.colors.dark[0],
      backgroundColor: active ? theme.colors.dark[5] : "transparent",
      boxShadow: active ? theme.shadows.md : "none",
      "&:hover": {
        backgroundColor: active ? theme.colors.dark[5] : theme.colors.dark[8],
      },
    },
  })
);
