import { useMemo } from "react";
import { useMantineTheme } from "@mantine/core";
import dayjs from "dayjs";
import { type EChartsOption } from "echarts";
import { useMediaMatch } from "../../../hooks/media-match";
import { abbreviateNumber, formatCurrency } from "../../../utils";

export function useDefaultChartConfig(
  xAxisData: number[] | string[],
  xAxisFormatter?: (v: any) => string
): EChartsOption {
  const { colors } = useMantineTheme();
  const isMobile = useMediaMatch();

  return useMemo(
    () => ({
      darkMode: true,
      textStyle: {
        fontFamily: globalThis.getComputedStyle(document.body).fontFamily,
      },
      dataZoom: { type: "inside", zoomLock: true },
      legend: {
        show: false,
        data: ["Budget", "Spent"],
        textStyle: {
          color: colors.gray[2],
          fontSize: 11,
        },
        inactiveColor: colors.gray[6],
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
              const parsed = Number.parseInt(params.value.toString());
              if (Number.isNaN(parsed)) return params.value.toString();
              return dayjs().set("month", parsed).format("MMMM");
            },
          },
          color: colors.red[2],
        },
      },
      xAxis: {
        type: "category",
        data: xAxisData,
        axisLabel: {
          formatter:
            xAxisFormatter ?? ((v: number) => dayjs().month(v).format("MMM")),
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
    [colors, isMobile, xAxisData, xAxisFormatter]
  );
}

export function tooltipFormatter(series: any) {
  const resolveValue = (item: any): number => {
    const raw = item?.value;
    if (typeof raw === "number") return raw;
    if (raw && typeof raw === "object" && typeof raw.value === "number")
      return raw.value;
    return 0;
  };

  const budget = series.find((o: any) => o.seriesName === "Budget");
  const spent = series.find((o: any) => o.seriesName === "Spent");
  const categoryItems = series.filter(
    (o: any) =>
      o.seriesName !== "Budget" &&
      o.seriesName !== "Spent" &&
      resolveValue(o) > 0
  );

  const hasBudget = resolveValue(budget) > 0;

  let html = '<div style="padding:4px 6px;width:240px;font-family:inherit;">';
  html += `<div style="font-weight:700;color:#fff;margin-bottom:4px;">${series[0].axisValueLabel}</div>`;

  if (hasBudget) {
    [budget, spent].filter(Boolean).forEach((item: any) => {
      html +=
        '<div style="display:flex;align-items:center;gap:6px;justify-content:space-between;">';
      html += `<span style="flex:1;color:${item.color};">${item.seriesName}</span>`;
      html += `<span style="color:${item.color};font-weight:700;">${formatCurrency(resolveValue(item))}</span>`;
      html += "</div>";
    });

    if (categoryItems.length > 0) {
      html +=
        '<div style="margin:6px 0;border-top:1px solid rgba(173,181,189,0.35);"></div>';

      categoryItems.forEach((item: any) => {
        html +=
          '<div style="display:flex;align-items:center;gap:6px;justify-content:space-between;">';
        html += `<span style="width:12px;height:12px;border-radius:6px;background:${item.color};display:inline-block;"></span>`;
        html += `<span style="flex:1;color:#adb5bd;">${item.seriesName}</span>`;
        html += `<span style="color:#ffffff;">${formatCurrency(resolveValue(item))}</span>`;
        html += "</div>";
      });
    }
  } else {
    html += '<div style="color:#adb5bd;">Budget missing for the month.</div>';
  }
  html += "</div>";
  return html;
}
