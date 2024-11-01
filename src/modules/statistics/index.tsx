import { Box, createStyles } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { APP_TITLE } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import type { YearStatsItem } from "../../services/response.type";
import { getYearStats } from "../../services/statistics.service";
import MonthSummary from "./components/MonthSummary";
import YearSummary from "./components/YearSummary";

type ChartData = YearStatsItem & { budget: number };

export default function StatsEngine() {
  const [year, setYear] = useState<string>(dayjs().year().toString());
  const [activeIndex, setActiveIndex] = useState(-1);
  const { onError } = useErrorHandler();

  useDocumentTitle(`${APP_TITLE} | Spend Statistics`);

  const { classes } = useChartTileClasses();

  const { isLoading, data } = useQuery({
    queryKey: ["stats", year],
    queryFn: () => getYearStats(year),
    onError,
  });

  const chartData: ChartData[] | null = useMemo(() => {
    return (
      data?.response.trend.map((summary) => ({
        ...summary,
        budget:
          data.response.budgets.find((item) => item.month === summary.month)
            ?.amount ?? 0,
      })) ?? null
    );
  }, [data]);

  const selected = useMemo(
    () => chartData?.[activeIndex] ?? null,
    [chartData, activeIndex]
  );

  return (
    <Box className={classes.card}>
      {selected ? (
        <MonthSummary
          data={selected}
          onClose={() => setActiveIndex(-1)}
          year={year}
          onNavigate={(dir) => setActiveIndex((v) => v + dir)}
          monthRange={[
            chartData?.at(0)?.month ?? 0,
            chartData?.at(-1)?.month ?? 0,
          ]}
        />
      ) : (
        <YearSummary
          isLoading={isLoading}
          data={chartData}
          year={year}
          setYear={setYear}
          onSelect={setActiveIndex}
        />
      )}
    </Box>
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
