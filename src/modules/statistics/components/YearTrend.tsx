import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Divider, Drawer, Group, Select, useMantineTheme } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { BarSeriesOption, type EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { _20Min } from "../../../constants/app";
import { useCurrentUser } from "../../../context/user.context";
import { useErrorHandler } from "../../../hooks/error-handler";
import { useMediaMatch } from "../../../hooks/media-match";
import { getCategoryGroups } from "../../../services/categories.service";
import { getYearStats } from "../../../services/statistics.service";
import { abbreviateNumber, formatCurrency } from "../../../utils";
import { BarLineClickParams, LegendSelection } from "../types";
import MonthBreakdown from "./MonthBreakdown";
import YearSummary from "./YearSummary";

const Arr12 = [...Array(12).keys()];

export default function YearTrend() {
  const [year, setYear] = useState<string>(dayjs().year().toString());
  const [focusMonth, setFocusMonth] = useState<number>(-1);
  const [focusDrawerOpen, { open, close }] = useDisclosure(false, {
    onClose: () => setFocusMonth(-1),
  });

  const { onError } = useErrorHandler();

  const isMobile = useMediaMatch();
  const { colors } = useMantineTheme();
  const { userData } = useCurrentUser();

  const chartConfig = useDefaultChartConfig();
  const chartRef = useRef<ReactECharts>(null);
  const getChart = () => chartRef.current?.getEchartsInstance();

  const { data: categoryGroupsRes } = useQuery({
    queryKey: ["category-groups"],
    queryFn: getCategoryGroups,
    onError,
    staleTime: _20Min,
  });

  const { data: statsRes, isLoading: loadingStats } = useQuery({
    queryKey: ["stats", year],
    queryFn: () => getYearStats(year),
    onError,
    enabled: !!categoryGroupsRes,
  });

  const yearOptions = useMemo(() => {
    const start = dayjs(userData?.createdAt).year();
    const end = dayjs().year();

    return [...Array(end - start + 1).keys()].map((v) =>
      (v + start).toString()
    );
  }, []);

  const budgets = useMemo(
    () =>
      Arr12.map((k) => {
        return {
          value:
            statsRes?.response.budgets.find((m) => m.month === k + 1)?.amount ??
            0,
        };
      }),
    [statsRes?.response]
  );

  const spends = useMemo(
    () =>
      Arr12.map((k, i) => {
        const value =
          statsRes?.response.trend.find((m) => m.month === k + 1)?.total ?? 0;

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
    [budgets, statsRes?.response]
  );

  const categoriesSeries = useMemo(() => {
    if (!categoryGroupsRes || !statsRes) return {};

    const series: Record<string, { value: number }[]> = Object.fromEntries(
      categoryGroupsRes?.response.map((c) => [c.name, []]) ?? []
    );
    Arr12.forEach((k) => {
      const list = statsRes?.response.trend.find((m) => m.month === k + 1);
      if (!list) {
        series.Entertainment.push({ value: 0 });
        series.Finance.push({ value: 0 });
        series["Food & Drinks"].push({ value: 0 });
        series["House & Utilities"].push({ value: 0 });
        series.Lifestyle.push({ value: 0 });
        series["Travel/Transportation"].push({ value: 0 });
        series.Uncategorized.push({ value: 0 });
      } else {
        const Entertainment = list.categories.find(
          (c) => c.name === "Entertainment"
        );
        const Finance = list.categories.find((c) => c.name === "Finance");
        const FoodnDrinks = list.categories.find(
          (c) => c.name === "Food & Drinks"
        );
        const HousenUtilities = list.categories.find(
          (c) => c.name === "House & Utilities"
        );
        const Lifestyle = list.categories.find((c) => c.name === "Lifestyle");
        const Travel = list.categories.find(
          (c) => c.name === "Travel/Transportation"
        );
        const Uncategorized = list.categories.find(
          (c) => c.name === "Uncategorized"
        );

        series.Entertainment.push({
          value: Entertainment?.amount ?? 0,
        });
        series.Finance.push({
          value: Finance?.amount ?? 0,
        });
        series["Food & Drinks"].push({
          value: FoodnDrinks?.amount ?? 0,
        });
        series["House & Utilities"].push({
          value: HousenUtilities?.amount ?? 0,
        });
        series.Lifestyle.push({
          value: Lifestyle?.amount ?? 0,
        });
        series["Travel/Transportation"].push({
          value: Travel?.amount ?? 0,
        });
        series.Uncategorized.push({
          value: Uncategorized?.amount ?? 0,
        });
      }
    });
    return series;
  }, [statsRes?.response, categoryGroupsRes?.response]);

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    categoryGroupsRes?.response.forEach((category) => {
      map[category.name] = category.color;
    });
    return map;
  }, [categoryGroupsRes?.response]);

  // Update Chart when any API response changes.
  // This is to avoid re-rendering the whole chart component.
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
      // Configure legends for categories.
      legend: {
        ...(chartConfig?.legend ?? {}),
        data: legends,
        selected:
          // Maintain the selection from previous alterations, if any.
          legends?.reduce(
            (acc, curr) => ({ ...acc, [curr]: legend?.[curr] ?? false }),
            {}
          ) ?? {},
      },
      // Configure bar data and line data
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
    // Update the chart.
    instance?.setOption(chartOpts, { notMerge: true });
  }, [budgets, categoriesSeries, spends]);

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
        setFocusMonth(event.dataIndex);
        open();
      }
    },
    [open]
  );

  const events = useMemo(
    () => ({ click: handleChartClick }),
    [handleChartClick]
  );

  return (
    <>
      <Group gap="sm">
        <Select
          variant="filled"
          size="xs"
          style={{ flexGrow: 0, flexShrink: 1, flexBasis: "75px" }}
          value={year}
          onChange={(e) => setYear(e ?? "")}
          data={yearOptions}
          mb={0}
          autoFocus
        />
        {/* CHECK: 
            Use the 'CategoryConfig' here if category bars are required on the same chart. 
            Computation is already implemented. */}
        <YearSummary
          year={year}
          spends={spends.map((v) => v.value)}
          budgets={budgets.map((v) => v.value)}
        />
      </Group>
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
          backgroundColor: " var(--mantine-color-dark-6)",
          width: "100%",
          height: "calc(100vh - 150px)",
        }}
      />
      <Drawer
        opened={focusDrawerOpen}
        onClose={close}
        position="right"
        size={isMobile ? "100vw" : "50vw"}
        title={`Breakdown for ${dayjs().month(focusMonth).format("MMMM")}, 
            ${dayjs().year(parseInt(year)).format("YYYY")}`}
      >
        {focusMonth > -1 && (
          <MonthBreakdown
            year={parseInt(year)}
            budget={
              statsRes?.response.budgets.find(
                (b) => b.month === focusMonth + 1
              ) ?? null
            }
          />
        )}
      </Drawer>
    </>
  );
}

function useDefaultChartConfig(): EChartsOption {
  const { colors } = useMantineTheme();
  const isMobile = useMediaMatch();

  return useMemo(
    () => ({
      textStyle: {
        fontFamily: window.getComputedStyle(document.body).fontFamily,
      },
      dataZoom: { type: "inside", zoomLock: true },
      legend: {
        show: false,
        data: ["Budget", "Spent"],
        selected:
          ["Budget", "Spent"]?.reduce(
            (acc, curr) => ({ ...acc, [curr]: true }),
            {}
          ) ?? {},
      },
      tooltip: {
        trigger: "axis",
        show: !isMobile,
        position: (
          _point: any,
          _params: any,
          _dom: any,
          _rect: any,
          size: { viewSize: number[]; contentSize: number[] }
        ) => {
          const [gridW] = size.viewSize;
          const [contentW] = size.contentSize;
          return [gridW - contentW - 10, 20];
        },
        formatter: tooltipFormatter,
        borderWidth: 0,
        borderColor: "transparent",
        extraCssText: `background-color: ${colors.dark[8]};`,
        axisPointer: {
          label: {
            formatter: (params) => {
              return dayjs()
                .set("month", parseInt(params.value.toString()))
                .format("MMMM");
            },
          },
          color: colors.red[2],
        },
      },
      xAxis: {
        type: "category",
        data: Arr12,
        axisLabel: {
          formatter: (v: number) => dayjs().month(v).format("MMM"),
          color: colors.gray[5],
          rotate: 90,
          interval: 0,
        },
        splitLine: {
          lineStyle: {
            type: "dotted",
            width: 1,
            color: colors.dark[4],
            showMinLine: false,
            showMaxLine: false,
          },
        },
      },
      yAxis: {
        type: "value",
        splitLine: {
          lineStyle: {
            type: "dotted",
            width: 1,
            color: colors.dark[4],
            showMinLine: false,
            showMaxLine: false,
          },
        },
        axisLabel: {
          formatter: abbreviateNumber,
          color: colors.gray[5],
        },
      },
      grid: {
        left: 5,
        right: 5,
        top: 25,
        bottom: 5,
        containLabel: true,
      },
    }),
    [colors, isMobile]
  );
}

function tooltipFormatter(series: any) {
  const hasBudget =
    (series.find((o: any) => o.seriesName === "Budget")?.value ?? 0) > 0;

  let html = '<div style="padding:4px 6px;width:240px;font-family:inherit;">';
  html += `<div style=\"font-weight:700;color:#fff;margin-bottom:4px;\">${series[0].axisValueLabel}</div>`;

  if (hasBudget) {
    series.forEach((item: any, index: number) => {
      const nameColor = index < 2 ? item.color : "#adb5bd";
      const valueColor = index < 2 ? item.color : "#ffffff";
      html +=
        '<div style="display:flex;align-items:center;gap:6px;justify-content:space-between;">';
      if (index > 1) {
        html += `<span style=\"width:12px;height:12px;border-radius:6px;background:${item.color};display:inline-block;\"></span>`;
      }
      html += `<span style=\"flex:1;color:${nameColor};\">${item.seriesName}</span>`;
      html += `<span style=\"color:${valueColor};${index < 2 ? "font-weight:700;" : ""}\">${formatCurrency(item.value)}</span>`;
      html += "</div>";
    });
    html +=
      '<div style="font-size:10px;font-style:italic;margin-top:6px;">Click on the dot to view details</div>';
  } else {
    html += '<div style="color:#adb5bd;">Budget missing for the month.</div>';
  }
  html += "</div>";
  return html;
}
