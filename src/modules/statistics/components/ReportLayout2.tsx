import { Box, createStyles, Group } from "@mantine/core";
import YearTrend from "./YearTrend";

export default function ReportLayout2() {
  const { classes } = useChartTileClasses();
  return (
    <Group spacing="sm" grow>
      <Box className={classes.card}>
        <YearTrend />
      </Box>
    </Group>
  );
}

const useChartTileClasses = createStyles((theme) => ({
  card: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.dark[6],
    boxShadow: theme.shadows.md,
    padding: theme.spacing.sm,
    height: "calc(100vh - 92px)",
  },
}));
