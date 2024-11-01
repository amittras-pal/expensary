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

  const chartData: ChartData[] = useMemo(() => {
    const startMonth = data?.response.trend[0].month ?? 1;
    const endMonth = data?.response.trend.at(-1)?.month ?? 12;
    const output: ChartData[] = [];
    Array(12)
      .keys()
      .map((v) => v + 1)
      .forEach((id) => {
        if (id < startMonth || id > endMonth)
          output.push({ month: id, budget: 0, total: 0, categories: [] });
        else {
          const item = data?.response.trend.find((item) => item.month === id);
          output.push({
            ...item!,
            budget:
              data?.response.budgets.find((item) => item.month === id)
                ?.amount ?? 0,
          });
        }
      });

    return output;
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
            data?.response.trend?.at(0)?.month ?? 0,
            data?.response.trend?.at(-1)?.month ?? 0,
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
