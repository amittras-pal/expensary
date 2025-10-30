import { useCallback, useEffect, useMemo } from "react";
import {
  Box,
  DefaultMantineColor,
  MantineColorsTuple,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconInfoCircle } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import ReactECharts from "echarts-for-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { _20Min, primaryColor } from "../../../constants/app";
import { useErrorHandler } from "../../../hooks/error-handler";
import { useMediaMatch } from "../../../hooks/media-match";
import {
  IExpensePlanAggregate,
  getPlans,
} from "../../../services/plans.service";
import { formatCurrency } from "../../../utils";
import { LoadingView, NoPlansView } from "../components/EmptyStates";
import { PlansViewContext } from "../types";

export default function TimelineView() {
  const props = useOutletContext<PlansViewContext>();
  const { onError } = useErrorHandler();
  const { colors } = useMantineTheme();
  const client = useQueryClient();
  const isMobile = useMediaMatch();

  const { data: closedPlansRes, isLoading: loadingClosedPlans } = useQuery({
    queryKey: ["plans-list", false],
    queryFn: () => getPlans("false"),
    refetchOnMount: false,
    staleTime: _20Min,
    enabled: props.showClosed,
    onError,
  });

  const { data: openPlansRes, isLoading: loadingOpenPlans } = useQuery({
    queryKey: ["plans-list", true],
    queryFn: () => getPlans("true"),
    refetchOnMount: false,
    staleTime: _20Min,
    onError,
  });

  useEffect(() => {
    if (isMobile)
      notifications.show({
        title: "Desktop Preferred",
        message: "Timeline View is best viewed on desktop screens.",
        icon: <IconInfoCircle size={20} />,
      });
  }, []);

  const plans: IExpensePlanAggregate[] = useMemo(() => {
    const merged: IExpensePlanAggregate[] = [
      ...(props.showClosed ? (closedPlansRes?.response ?? []) : []),
      ...(openPlansRes?.response ?? []),
    ];
    return merged.toSorted((a, b) => {
      const aDate = a.executionRange?.from
        ? dayjs(a.executionRange.from).valueOf()
        : 0;
      const bDate = b.executionRange?.from
        ? dayjs(b.executionRange.from).valueOf()
        : 0;
      return aDate - bDate;
    });
  }, [openPlansRes, closedPlansRes, props.showClosed]);

  const refreshList = () => {
    client.invalidateQueries(["plans-list", true]);
    if (props.showClosed) client.invalidateQueries(["plans-list", false]);
  };

  const chartRange = useMemo<
    [string | Date | undefined, string | Date | undefined]
  >(() => {
    if (!plans.length) return [undefined, undefined];
    const firstPlan = plans[0];
    const lastPlan = plans[plans.length - 1];
    const candidates = [
      firstPlan.firstExpense?.date,
      lastPlan.lastExpense?.date,
      firstPlan.executionRange?.from,
      lastPlan.executionRange?.to,
    ].filter(Boolean) as (string | Date)[];

    if (!candidates.length) return [undefined, undefined];
    const sorted = candidates.toSorted(
      (a, b) => dayjs(a).valueOf() - dayjs(b).valueOf()
    );
    return [sorted[0], sorted[sorted.length - 1]];
  }, [plans]);

  const navigate = useNavigate();
  const handleChartClick = useCallback((e: any) => {
    navigate(`/plans/${e.data.at(3)}`);
  }, []);
  const events = useMemo(() => ({ click: handleChartClick }), []);

  const chartConfig = {
    textStyle: {
      fontFamily: window.getComputedStyle(document.body).fontFamily,
    },
    title: {
      text: props.showClosed
        ? `All Plans (${plans.length})`
        : `Active Plans (${plans.length})`,
      left: "left",
      textStyle: {
        color: colors.gray[5],
        fontSize: 16,
      },
    },
    tooltip: {
      trigger: "item",
      borderColor: "transparent",
      extraCssText: `background-color:var(--mantine-color-dark-8);`,
      formatter: function (args: any) {
        const planDetails: IExpensePlanAggregate | undefined =
          plans[args.dataIndex];
        if (!planDetails) return "";
        return getTooltipContent(planDetails, args.seriesName, colors);
      },
    },
    legend: {
      show: false,
      data: ["Schedule", "Expenses"],
    },
    grid: {
      // Reduced left gap since y-axis labels will render inside the chart now
      left: 20,
      right: 20,
      top: 50,
      bottom: 20,
    },
    dataZoom: dataZooConfig,
    xAxis: {
      show: true,
      type: "time",
      min: chartRange[0]
        ? dayjs(chartRange[0]).startOf("day").toISOString()
        : undefined,
      max: chartRange[1]
        ? dayjs(chartRange[1]).endOf("day").toISOString()
        : undefined,
      axisLine: {
        show: true,
        lineStyle: {
          color: colors.dark[2],
          width: 1,
          type: "solid",
        },
      },
      axisTick: {
        show: true,
        length: 6,
        lineStyle: {
          color: colors.dark[2],
          width: 1,
        },
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: "category",
      data: plans.map((p) => p.name),
      axisLabel: {
        inside: true,
        // Align text left and push it a few pixels into plotting area
        align: "left",
        padding: [0, 0, 0, 4],
        color: colors.dark[2],
        fontSize: 12,
      },
      legend: { show: false },
      splitLine: {
        show: true,
        lineStyle: {
          color: colors.dark[4],
          width: 1,
          type: "dashed",
        },
      },
    },
    series: [
      {
        type: "custom",
        name: "Schedule",
        renderItem: function (_params: any, api: any) {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = api.size([0, 1])[1] * 0.5;
          const plan = plans[categoryIndex];
          const color = getColor(plan, colors);

          // Main block (execution range)
          const block = {
            type: "rect",
            shape: {
              x: start[0],
              y: start[1] - height / 2,
              width: end[0] - start[0],
              height: height,
            },
            // api.style deprecated; provide literal style object
            style: { fill: color },
          } as any;

          // Wick line (firstExpense.date to lastExpense.date)
          let wick: any = null;
          if (plan?.firstExpense?.date && plan?.lastExpense?.date) {
            const wickStart = api.coord([
              plan.firstExpense.date,
              categoryIndex,
            ]);
            const wickEnd = api.coord([plan.lastExpense.date, categoryIndex]);
            wick = {
              type: "rect",
              shape: {
                x: wickStart[0],
                y: start[1] - 1, // 2px high centered-ish
                width: wickEnd[0] - wickStart[0],
                height: 1,
              },
              style: { fill: color, opacity: 0.9 },
            };
          }

          if (wick) return { type: "group", children: [block, wick] } as any;
          return block;
        },
        encode: { x: [1, 2], y: 0 },
        data: plans.map((p, i) => [
          i,
          p.executionRange?.from,
          p.executionRange?.to,
        ]),
        markLine: {
          symbol: "none",
          label: {
            formatter: dayjs().format("DD MMM, 'YY"),
            position: "end",
            color: colors.gray[5],
          },
          lineStyle: {
            type: "dashed",
            color: colors.dark[2],
            width: 1,
          },
          silent: true,
          data: [{ xAxis: dayjs().startOf("day").toISOString() }],
        },
      },
      // Separate series just for wick lines so they don't disappear when execution range is outside zoom
      {
        type: "custom",
        name: "Expenses",
        renderItem: function (_params: any, api: any) {
          const categoryIndex = api.value(0);
          const wickStartCoord = api.coord([api.value(1), categoryIndex]);
          const wickEndCoord = api.coord([api.value(2), categoryIndex]);
          const plan = plans[categoryIndex];
          if (!plan) return null;
          const color = getColor(plan, colors);
          return {
            type: "rect",
            shape: {
              x: wickStartCoord[0],
              y: wickStartCoord[1] - 1,
              width: wickEndCoord[0] - wickStartCoord[0],
              height: 2,
            },
            style: { fill: color, opacity: 0.9 },
          };
        },
        encode: { x: [1, 2], y: 0 },
        data: plans
          .map((p, i) =>
            p.firstExpense?.date && p.lastExpense?.date
              ? [i, p.firstExpense.date, p.lastExpense.date]
              : null
          )
          .filter(Boolean),
      },
    ],
  };

  if (loadingOpenPlans) return <LoadingView />;

  if (
    (!openPlansRes?.response.length && !props.showClosed) ||
    (props.showClosed && !closedPlansRes?.response.length)
  )
    return (
      <NoPlansView
        loadingClosedPlans={loadingClosedPlans}
        onShowClosedClick={props.onShowClosedClick}
        closedPlans={closedPlansRes?.response.length ?? 0}
        showClosed={props.showClosed}
        refreshPlans={refreshList}
      />
    );

  return (
    <Box>
      <ReactECharts
        option={chartConfig}
        onEvents={events}
        style={{
          borderRadius: "var(--mantine-radius-md)",
          padding: "var(--mantine-spacing-xs)",
          backgroundColor: " var(--mantine-color-dark-6)",
          width: "100%",
          height: "calc(100vh - 135px)",
        }}
      />
    </Box>
  );
}

function getTooltipContent(
  planDetails: IExpensePlanAggregate,
  highlight: "Schedule" | "Expenses",
  colors: Record<DefaultMantineColor, MantineColorsTuple>
) {
  const execFrom = planDetails.executionRange?.from
    ? dayjs(planDetails.executionRange.from).format("DD MMM 'YY")
    : "N/A";
  const execTo = planDetails.executionRange?.to
    ? dayjs(planDetails.executionRange.to).format("DD MMM 'YY")
    : "N/A";
  const planningStart = planDetails.firstExpense?.date
    ? dayjs(planDetails.firstExpense.date).format("DD MMM 'YY")
    : "N/A";
  const planningEnd = planDetails.lastExpense?.date
    ? dayjs(planDetails.lastExpense.date).format("DD MMM 'YY")
    : "N/A";
  const totalExpense = planDetails.totalExpense ?? 0;

  // When highlighted, swap the gray color scale for the primary color scale (same numeric suffix)
  const execLabelColor = highlight === "Schedule" ? "primary" : "gray";
  const execValueColor = highlight === "Schedule" ? "primary" : "gray";
  const expensesLabelColor = highlight === "Expenses" ? "primary" : "gray";
  const expensesValueColor = highlight === "Expenses" ? "primary" : "gray";
  return [
    `<div style="display:flex;flex-direction:column;gap:4px;">`,
    `<div style="font-weight:600;font-size:16px;color:var(--mantine-color-gray-2);margin-bottom:var(--mantine-spacing-xs)">${planDetails.name} <span style="margin-left:6px;color:${getColor(planDetails, colors)}">${getState(planDetails)}</span></div>`,
    `<div style="font-size:14px;"><span style="color:var(--mantine-color-${execLabelColor}-5)">Schedule Days:</span> <span style="color:var(--mantine-color-${execValueColor}-2)">${execFrom} → ${execTo}</span></div>`,
    `<div style="font-size:14px;"><span style="color:var(--mantine-color-${expensesLabelColor}-5)">Expenses added between:</span> <span style="color:var(--mantine-color-${expensesValueColor}-2)">${planningStart} → ${planningEnd}</span></div>`,
    `<div style="font-size:14px;"><span style="color:var(--mantine-color-gray-5)">Total spent:</span> <span style="color:var(--mantine-color-gray-2)">${formatCurrency(totalExpense)}</span></div>`,
    `<div style="font-size:12px;color:var(--mantine-color-gray-6); font-style:italic;margin-top:var(--mantine-spacing-xs)">Click to view details</div>`,
    `</div>`,
  ].join("");
}

function getColor(
  plan: IExpensePlanAggregate,
  colors: Record<DefaultMantineColor, MantineColorsTuple>
) {
  if (!plan) return "transparent";
  if (!plan.open) return colors.gray[5];
  if (plan.open && dayjs(plan.executionRange?.to).isBefore(dayjs(), "date"))
    return colors.orange[5];
  return colors.green[5];
}

function getState(plan: IExpensePlanAggregate) {
  if (!plan) return "";
  if (!plan.open) return "[Closed]";
  if (plan.open && dayjs(plan.executionRange?.to).isBefore(dayjs(), "date"))
    return "[Open; Past Schedule]";
  return "[Open]";
}

const dataZooConfig = [
  // Horizontal (time axis)
  {
    type: "slider",
    show: false,
    xAxisIndex: 0,
    filterMode: "weakFilter",
    height: 24,
    bottom: 10,
    brushSelect: false,
    handleSize: 12,
    moveOnMouseMove: true,
    showDetail: false,
    realtime: true,
  },
  {
    type: "inside",
    xAxisIndex: 0,
    filterMode: "weakFilter",
    zoomOnMouseWheel: true,
    moveOnMouseWheel: true,
    moveOnMouseMove: true,
  },
  // Vertical (plans axis)
  {
    type: "slider",
    show: false,
    yAxisIndex: 0,
    filterMode: "empty",
    width: 18,
    left: 0,
    top: 60,
    bottom: 60,
    brushSelect: false,
    handleSize: 10,
    showDetail: false,
    realtime: true,
  },
  {
    type: "inside",
    yAxisIndex: 0,
    filterMode: "empty",
    zoomOnMouseWheel: true,
    moveOnMouseWheel: true,
    moveOnMouseMove: true,
  },
];
