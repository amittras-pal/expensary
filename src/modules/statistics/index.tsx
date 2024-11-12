import { Box, createStyles, Group } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { APP_TITLE } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import type { YearStatsItem } from "../../services/response.type";
import { getYearStats } from "../../services/statistics.service";
import MonthDonut from "./components/MonthDonut";
import YearTrend from "./components/YearTrend";

type ChartData = YearStatsItem & { budget: number };

export default function StatsEngine() {
  const [year, setYear] = useState<string>(dayjs().year().toString());
  const [activeIndex, setActiveIndex] = useState(-1);
  const { onError } = useErrorHandler();

  useDocumentTitle(`${APP_TITLE} | Spend Statistics`);
  const isMobile = useMediaMatch();
  const { classes } = useChartTileClasses();

  const { isLoading, data } = useQuery({
    queryKey: ["stats", year],
    queryFn: () => getYearStats(year),
    onError,
  });

  const chartData: ChartData[] = useMemo(() => {
    if (!data?.response?.trend) return [];
    const startMonth = data.response.trend.at(0)?.month ?? 1;
    const endMonth = data.response.trend.at(-1)?.month ?? 12;
    const output: ChartData[] = [];
    Array(12)
      .keys()
      .forEach((k) => {
        const id = k + 1;
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
    <Group spacing="sm" grow>
      {(!isMobile || (isMobile && activeIndex === -1)) && (
        <Box className={classes.card}>
          <YearTrend
            isLoading={isLoading}
            data={chartData}
            year={year}
            month={activeIndex}
            setYear={setYear}
            onSelect={setActiveIndex}
            disableChange={activeIndex > -1}
          />
        </Box>
      )}
      {activeIndex > -1 && (
        <Box className={classes.card}>
          <MonthDonut
            data={selected}
            year={year}
            onNavigate={(dir) => setActiveIndex((v) => v + dir)}
            onClose={() => setActiveIndex(-1)}
            monthRange={[
              data?.response.trend.at(0)?.month ?? 0,
              data?.response.trend.at(-1)?.month ?? 0,
            ]}
          />
        </Box>
      )}
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
