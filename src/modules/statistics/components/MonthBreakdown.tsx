import { useEffect, useMemo, useRef } from "react";
import { Box, Divider, Text, useMantineTheme } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { useErrorHandler } from "../../../hooks/error-handler";
import { BudgetForm } from "../../../schemas/schemas";
import { getSummary } from "../../../services/expense.service";
import { formatCurrency } from "../../../utils";
import { SunBurstClickParams } from "../types";
import ListDetails, { ListDetailsHandle } from "./MonthBreakdownDetails";

type MonthDonutProps = {
  year: number;
  month: number;
  budget: BudgetForm | null;
  initialCategory?: string | null;
};
export default function MonthBreakdown({
  budget,
  year,
  month,
  initialCategory = null,
}: Readonly<MonthDonutProps>) {
  const { onError } = useErrorHandler();
  const { colors } = useMantineTheme();
  const payload = useMemo(() => {
    const date = dayjs().month(month - 1).year(year);
    return {
      startDate: date.startOf("month").toDate(),
      endDate: date.endOf("month").toDate(),
    };
  }, [month, year]);

  const { data: summary, isLoading } = useQuery({
    queryKey: ["month-breakdown", payload],
    queryFn: () => getSummary(null, payload),
    onError,
  });

  const conditioned = useMemo(
    () =>
      summary?.response
        ? Object.entries(summary.response.summary).map(([category, breakdown]) => ({
            name: category,
            total: breakdown.total,
            color: breakdown.subCategories[0]?.color,
            children: breakdown.subCategories.map((subc) => ({
              name: subc.label,
              value: subc.value,
              color: subc.color,
            })),
          }))
        : [],
    [summary?.response]
  );

  const initialCategoryNode = useMemo(
    () => conditioned.find((entry) => entry.name === initialCategory),
    [conditioned, initialCategory]
  );

  const config = useMemo(() => {
    const chartData = initialCategoryNode ? [initialCategoryNode] : conditioned;

    const option: EChartsOption = {
      series: {
        type: "sunburst",
        data: chartData.map((category) => ({
          name: category.name,
          value: category.total,
          itemStyle: {
            color: colors[category.color ?? "gray"][7],
          },
          children: category.children.map((subc) => ({
            name: subc.name,
            value: subc.value,
            itemStyle: {
              color: colors[subc.color][5],
            },
          })),
        })),
        radius: [40, "90%"],
        itemStyle: {
          borderRadius: 4,
          borderWidth: 2,
          borderColor: colors.gray[9],
        },
        label: {
          show: false,
          rotate: "radial",
          color: colors.gray[1],
        },
        emphasis: {
          label: {
            show: true,
          },
        },
      },
    };

    return option;
  }, [conditioned, colors, initialCategoryNode]);

  const listDetails = useRef<ListDetailsHandle>(null);

  useEffect(() => {
    if (!summary?.response || !initialCategoryNode) return;

    listDetails.current?.update([
      { name: "", value: summary.response.total, dataIndex: 0 },
      {
        name: initialCategoryNode.name,
        value: initialCategoryNode.total,
        dataIndex: 0,
      },
    ]);
  }, [initialCategoryNode, summary?.response]);

  const handleClick = (e: SunBurstClickParams) => {
    listDetails.current?.update(e.treePathInfo);
  };

  return (
    <Box style={{ height: "calc(100vh - 75px)" }} fz="sm">
      <ReactECharts
        option={config}
        style={{ width: "100%", height: "50%" }}
        showLoading={isLoading}
        loadingOption={{
          maskColor: colors.dark[7],
          textColor: colors.gray[2],
        }}
        onEvents={{
          click: handleClick,
          dataZoom: handleClick,
        }}
      />
      <Text ta="right" fz="xs" fs="italic" c="dimmed">
        Click on any segment to focus.
      </Text>
      <Divider my="xs" />
      <Text c="dimmed">
        Set Budget:{" "}
        <Text component="span" c={colors.gray[1]}>
          {formatCurrency(budget?.amount ?? 0)}
        </Text>
      </Text>
      {budget?.remarks && (
        <Text c="dimmed">
          Remarks for budget:{" "}
          <Text component="span" c={colors.gray[1]}>
            {budget.remarks}
          </Text>
        </Text>
      )}
      <Divider my="sm" />
      <ListDetails
        ref={listDetails}
        defaultTotal={summary?.response.total ?? 0}
        budget={budget?.amount ?? 0}
        month={month}
        year={year}
      />
    </Box>
  );
}
