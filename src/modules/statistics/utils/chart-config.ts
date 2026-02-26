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
  const hasBudget =
    (series.find((o: any) => o.seriesName === "Budget")?.value ?? 0) > 0;

  let html = '<div style="padding:4px 6px;width:240px;font-family:inherit;">';
  html += `<div style="font-weight:700;color:#fff;margin-bottom:4px;">${series[0].axisValueLabel}</div>`;

  if (hasBudget) {
    series.forEach((item: any, index: number) => {
      const nameColor = index < 2 ? item.color : "#adb5bd";
      const valueColor = index < 2 ? item.color : "#ffffff";
      html +=
        '<div style="display:flex;align-items:center;gap:6px;justify-content:space-between;">';
      if (index > 1) {
        html += `<span style="width:12px;height:12px;border-radius:6px;background:${item.color};display:inline-block;"></span>`;
      }
      html += `<span style="flex:1;color:${nameColor};">${item.seriesName}</span>`;
      html += `<span style="color:${valueColor};${index < 2 ? "font-weight:700;" : ""}">${formatCurrency(item.value)}</span>`;
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
