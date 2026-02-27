import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActionIcon,
  Divider,
  Drawer,
  Flex,
  Select,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { BarSeriesOption, type EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { _20Min } from "../../../constants/app";
import { useErrorHandler } from "../../../hooks/error-handler";
import { useMediaMatch } from "../../../hooks/media-match";
import { getCategoryGroups } from "../../../services/categories.service";
import { getRollingStats } from "../../../services/statistics.service";
import { BarLineClickParams, LegendSelection } from "../types";
import { useDefaultChartConfig } from "../utils/chart-config";
import MonthBreakdown from "./MonthBreakdown";
import RollingSummary from "./RollingSummary";

type Slot = { month: number; year: number };

export default function RollingTrend() {
  const [months, setMonths] = useState<number>(6);
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const [focusDrawerOpen, { open, close }] = useDisclosure(false, {
    onClose: () => setFocusIndex(-1),
  });
  const { onError } = useErrorHandler();
  const isMobile = useMediaMatch();
  const { colors } = useMantineTheme();

  // Compute the ordered month/year slots for the selected window.
  const slots = useMemo<Slot[]>(
    () =>
      Array.from({ length: months }, (_, i) => {
        const d = dayjs().subtract(months - 1 - i, "month");
        return { month: d.month() + 1, year: d.year() };
      }),
    [months]
  );

  const xAxisLabels = useMemo(
    () =>
      slots.map((s) =>
        dayjs()
          .month(s.month - 1)
          .year(s.year)
          .format("MMM 'YY")
      ),
    [slots]
  );

  const chartConfig = useDefaultChartConfig(xAxisLabels, (v: string) => v);
  const chartRef = useRef<ReactECharts>(null);
  const getChart = () => chartRef.current?.getEchartsInstance();

  const { data: categoryGroupsRes } = useQuery({
    queryKey: ["category-groups"],
    queryFn: getCategoryGroups,
    onError,
    staleTime: _20Min,
  });

  const { data: statsRes, isLoading: loadingStats } = useQuery({
    queryKey: ["rolling-stats", months],
    queryFn: () => getRollingStats(months),
    onError,
    enabled: !!categoryGroupsRes,
  });

  const budgets = useMemo(
    () =>
      slots.map((s) => ({
        value:
          statsRes?.response.budgets.find(
            (b) => b.month === s.month && b.year === s.year
          )?.amount ?? 0,
      })),
    [statsRes?.response, slots]
  );

  const budgetIndexRange = useMemo((): [number, number] => {
    const firstIndex = budgets.findIndex((b) => b.value > 0);
    const lastIndex = budgets.reduceRight((acc, b, idx) => {
      if (acc === -1 && b.value > 0) return idx;
      return acc;
    }, -1);
    return [firstIndex, lastIndex];
  }, [budgets]);

  const spends = useMemo(
    () =>
      slots.map((s, i) => {
        const value =
          statsRes?.response.trend.find(
            (t) => t.month === s.month && t.year === s.year
          )?.total ?? 0;

        let itemColor = colors.indigo[6];
        if (value > budgets[i].value) itemColor = colors.red[6];
        else if (value < budgets[i].value) itemColor = colors.green[6];

        return {
          value,
          itemStyle: {
            color: itemColor,
            borderWidth: 3,
            borderColor: colors.dark[6],
          },
        };
      }),
    [budgets, statsRes?.response, slots]
  );

  const categoriesSeries = useMemo(() => {
    if (!categoryGroupsRes || !statsRes) return {};

    const series: Record<string, { value: number }[]> = Object.fromEntries(
      categoryGroupsRes.response.map((c) => [c.name, []])
    );

    slots.forEach((s) => {
      const list = statsRes.response.trend.find(
        (t) => t.month === s.month && t.year === s.year
      );
      categoryGroupsRes.response.forEach((cat) => {
        const found = list?.categories.find((c) => c.name === cat.name);
        series[cat.name].push({ value: found?.amount ?? 0 });
      });
    });

    return series;
  }, [statsRes?.response, categoryGroupsRes?.response, slots]);

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    categoryGroupsRes?.response.forEach((category) => {
      map[category.name] = category.color;
    });
    return map;
  }, [categoryGroupsRes?.response]);

  // Midpoints between Dec and Jan where the year changes.
  const yearChangeMarkers = useMemo(
    () =>
      slots.reduce<{ xAxis: number }[]>((acc, s, i) => {
        if (i > 0 && s.year !== slots[i - 1].year)
          acc.push({ xAxis: i });
        return acc;
      }, []),
    [slots]
  );

  // Update chart when data changes.
  useEffect(() => {
    const legends = [
      "Budget",
      "Spent",
      ...(categoryGroupsRes?.response ?? []).map((cat) => cat.name),
    ];

    const instance = getChart();
    const legend = (instance?.getOption().legend as any)[0]
      ?.selected as LegendSelection;

    const chartOpts: EChartsOption = {
      ...chartConfig,
      legend: {
        ...(chartConfig?.legend),
        data: legends,
        selected:
          legends?.reduce(
            (acc, curr) => ({ ...acc, [curr]: legend?.[curr] ?? false }),
            {}
          ) ?? {},
      },
      series: [
        {
          name: "Budget",
          type: "line",
          smooth: true,
          data: budgets,
          symbol: "circle",
          symbolSize: 10,
          lineStyle: {
            type: "dashed",
            width: 1,
            color: colors.gray[6],
          },
          itemStyle: {
            color: colors.gray[6],
            borderWidth: 3,
            borderColor: colors.dark[6],
          },
          markLine: {
            silent: true,
            symbol: "none",
            label: { show: false },
            lineStyle: {
              type: "solid",
              width: 1,
              color: colors.dark[3],
            },
            data: yearChangeMarkers,
          },
        },
        {
          name: "Spent",
          type: "line",
          smooth: true,
          data: spends,
          symbol: "circle",
          symbolSize: 14,
          lineStyle: {
            width: 1,
            color: colors.gray[3],
          },
        },
        ...Object.entries(categoriesSeries).map(
          ([name, data]): BarSeriesOption => ({
            name,
            type: "bar",
            data: data,
            stack: "total",
            barWidth: isMobile ? 15 : 35,
            emphasis: {
              itemStyle: {
                color: colors[categoryColorMap[name]][4] ?? colors.gray[4],
              },
            },
            itemStyle: {
              color: colors[categoryColorMap[name]][6] ?? colors.gray[6],
            },
          })
        ),
      ],
    };
    instance?.setOption(chartOpts, { notMerge: true });
  }, [budgets, categoriesSeries, spends, yearChangeMarkers]);

  const handleChartClick = useCallback(
    (event: BarLineClickParams) => {
      let isFocusable: boolean = false;
      if (event.seriesName === "Budget") {
        isFocusable = event.value > 0;
      } else {
        const series = getChart()?.getOption().series as LineSeriesOption[];
        const bSeries = series.find((s) => s.name === "Budget");
        const budgetValue = bSeries?.data?.[event.dataIndex]?.valueOf() as {
          value: number;
        };
        isFocusable = budgetValue.value > 0;
      }

      if (isFocusable) {
        const instance = getChart();
        instance?.dispatchAction({ type: "hideTip" });
        setFocusIndex(event.dataIndex);
        open();
      }
    },
    [open]
  );

  const events = useMemo(
    () => ({ click: handleChartClick }),
    [handleChartClick]
  );

  const focusSlot = focusIndex > -1 ? slots[focusIndex] : null;

  return (
    <>
      <Flex gap="sm" align="center" wrap="nowrap">
        <Select
          value={months.toString()}
          mb={0}
          size="xs"
          onChange={(v) => v && setMonths(Number.parseInt(v))}
          data={[
            { label: "6 Months", value: "6" },
            { label: "9 Months", value: "9" },
            { label: "1 Year", value: "12" },
            { label: "2 Years", value: "24" },
            // TODO
            // { label: "All Time", value: dayjs().diff(dayjs(userData?.createdAt), "months").toString()}
          ]}
          allowDeselect={false}
          style={{ width: 140 }}
        />
        <RollingSummary
          months={months}
          spends={spends.map((v) => v.value)}
          budgets={budgets.map((v) => v.value)}
          slots={slots}
        />
      </Flex>
      <Divider my="sm" style={{ width: "100%" }} />
      <ReactECharts
        showLoading={loadingStats}
        loadingOption={{
          maskColor: colors.dark[7],
          textColor: colors.gray[2],
        }}
        option={chartConfig}
        ref={chartRef}
        onEvents={events}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          padding: "var(--mantine-spacing-xs)",
          backgroundColor: "var(--mantine-color-dark-6)",
          width: "100%",
          height: "calc(100vh - 150px)",
        }}
      />
      <Drawer
        opened={focusDrawerOpen}
        onClose={close}
        position="right"
        withCloseButton={false}
        size={isMobile ? "100vw" : "50vw"}
      >
        <Flex justify={"space-between"} align={"center"} w={"100%"}>
          <Text mb={0} fz="lg">
            Breakdown for{" "}
            {focusSlot
              ? dayjs()
                  .month(focusSlot.month - 1)
                  .format("MMMM")
              : ""}
            , {focusSlot?.year ?? ""}
          </Text>
          <Flex gap={"xs"}>
            <Tooltip label="Previous month">
              <ActionIcon
                onClick={() => setFocusIndex((v) => --v)}
                radius={"xl"}
                variant="default"
                disabled={focusIndex === budgetIndexRange[0]}
              >
                <IconChevronLeft size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Next month">
              <ActionIcon
                onClick={() => setFocusIndex((v) => ++v)}
                radius={"xl"}
                variant="default"
                disabled={focusIndex === budgetIndexRange[1]}
              >
                <IconChevronRight size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Close">
              <ActionIcon onClick={close} radius={"xl"} variant="default">
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </Flex>
        {focusSlot && (
          <MonthBreakdown
            year={focusSlot.year}
            budget={
              statsRes?.response.budgets.find(
                (b) => b.month === focusSlot.month && b.year === focusSlot.year
              ) ?? null
            }
          />
        )}
      </Drawer>
    </>
  );
}
