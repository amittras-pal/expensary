import { createStyles } from "@mantine/core";

export const useAppStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    alignItems: "flex-end",
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
      display: "flex",
      alignItems: "center",
      gap: theme.spacing.sm,
      width: "100%",
      borderRadius: theme.radius.sm,
      color: theme.colors.dark[0],
      fontWeight: active ? "bold" : "normal",
      "&:hover": {
        backgroundColor: theme.colors.dark[5],
      },
    },
  })
);
