import { useCallback, useMemo } from "react";
import { useMantineTheme } from "@mantine/core";
import { type EChartsOption, LineSeriesOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { useMediaMatch } from "../../../hooks/media-match";
import { BarLineClickParams } from "../types";
import { useDefaultChartConfig } from "../utils/chart-config";

type Point = {
  value: number;
  itemStyle?: { color: string; borderWidth: number; borderColor: string };
};

type Props = {
  xAxisLabels: string[];
  budgets: { value: number }[];
  spends: Point[];
  yearChangeMarkers: { xAxis: number }[];
  loading: boolean;
  showCategoryStack: boolean;
  categoriesSeries: Record<string, { value: number }[]>;
  categoryColorMap: Record<string, string>;
  onPointClick?: (event: BarLineClickParams, chart?: any) => void;
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const fullHex =
    normalized.length === 3
      ? normalized
          .split("")
          .map((ch) => `${ch}${ch}`)
          .join("")
      : normalized;

  const parsed = Number.parseInt(fullHex, 16);
  if (Number.isNaN(parsed)) return `rgba(173,181,189,${alpha})`;

  const r = (parsed >> 16) & 255;
  const g = (parsed >> 8) & 255;
  const b = parsed & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function BudgetVsSpentChart({
  xAxisLabels,
  budgets,
  spends,
  yearChangeMarkers,
  loading,
  showCategoryStack,
  categoriesSeries,
  categoryColorMap,
  onPointClick,
}: Readonly<Props>) {
  const { colors } = useMantineTheme();
  const isMobile = useMediaMatch();
  const chartConfig = useDefaultChartConfig(xAxisLabels, (v: string) => v);

  const option = useMemo<EChartsOption>(
    () => ({
      ...chartConfig,
      yAxis: {
        ...chartConfig.yAxis,
        boundaryGap: [0, "10%"],
      },
      legend: {
        ...chartConfig.legend,
        show: true,
        data: showCategoryStack
          ? ["Budget", "Spent", ...Object.keys(categoriesSeries)]
          : ["Budget", "Spent"],
        selected: showCategoryStack
          ? {
              Budget: true,
              Spent: true,
              ...Object.fromEntries(
                Object.keys(categoriesSeries).map((key) => [key, true])
              ),
            }
          : { Budget: true, Spent: true },
      },
      series: [
        ...(showCategoryStack
          ? Object.entries(categoriesSeries).map(
              ([name, data]): LineSeriesOption => ({
                name,
                type: "line",
                data,
                smooth: true,
                symbol: "none",
                triggerLineEvent: true,
                stack: "total",
                lineStyle: {
                  width: isMobile ? 1.25 : 1.6,
                  color:
                    colors[
                      categoryColorMap[name] as keyof typeof colors
                    ]?.[5] ?? colors.gray[4],
                },
                areaStyle: {
                  opacity: 1,
                  color: hexToRgba(
                    colors[
                      categoryColorMap[name] as keyof typeof colors
                    ]?.[6] ?? colors.gray[6],
                    0.56
                  ),
                },
                emphasis: {
                  focus: "series",
                  lineStyle: {
                    width: 2,
                    color:
                      colors[
                        categoryColorMap[name] as keyof typeof colors
                      ]?.[4] ?? colors.gray[3],
                  },
                  areaStyle: {
                    color: hexToRgba(
                      colors[
                        categoryColorMap[name] as keyof typeof colors
                      ]?.[5] ?? colors.gray[5],
                      0.72
                    ),
                  },
                },
                itemStyle: {
                  color:
                    colors[
                      categoryColorMap[name] as keyof typeof colors
                    ]?.[6] ?? colors.gray[6],
                },
                z: 1,
              })
            )
          : []),
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
          z: 4,
        } as LineSeriesOption,
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
          z: 5,
        } as LineSeriesOption,
      ],
    }),
    [
      budgets,
      categoriesSeries,
      categoryColorMap,
      chartConfig,
      colors,
      isMobile,
      showCategoryStack,
      spends,
      yearChangeMarkers,
    ]
  );

  const handleLegendSelectChanged = useCallback((params: any, chart: any) => {
    if (params?.name === "Budget" || params?.name === "Spent") {
      chart?.dispatchAction({ type: "legendSelect", name: "Budget" });
      chart?.dispatchAction({ type: "legendSelect", name: "Spent" });
    }
  }, []);

  const events = useMemo(() => {
    const mappedEvents: Record<string, (...args: any[]) => void> = {
      legendselectchanged: handleLegendSelectChanged,
    };

    if (onPointClick) {
      mappedEvents.click = (event: BarLineClickParams, chart: any) =>
        onPointClick(event, chart);
    }

    return mappedEvents;
  }, [handleLegendSelectChanged, onPointClick]);

  return (
    <ReactECharts
      showLoading={loading}
      loadingOption={{
        maskColor: colors.dark[7],
        textColor: colors.gray[2],
      }}
      option={option}
      notMerge={true}
      onEvents={events}
      style={{
        borderRadius: "var(--mantine-radius-md)",
        padding: "var(--mantine-spacing-xs)",
        backgroundColor: "var(--mantine-color-dark-6)",
        width: "100%",
        height: "calc(100vh - 150px)",
      }}
    />
  );
}
