import { Box, Divider, Text, useMantineTheme } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import { useMemo, useRef } from "react";
import { useErrorHandler } from "../../../hooks/error-handler";
import { BudgetForm } from "../../../schemas/schemas";
import { getSummary } from "../../../services/expense.service";
import { formatCurrency } from "../../../utils";
import { SunBurstClickParams } from "../types";
import ListDetails, { ListDetailsHandle } from "./MonthBreakdownDetails";

type MonthDonutProps = {
  year: number;
  budget: BudgetForm | null;
};
export default function MonthBreakdown({
  budget,
  year,
}: Readonly<MonthDonutProps>) {
  const { onError } = useErrorHandler();
  const { colors } = useMantineTheme();
  const payload = useMemo(() => {
    const date = dayjs()
      .month((budget?.month ?? 0) - 1)
      .year(year);
    return {
      startDate: date.startOf("month").toDate(),
      endDate: date.endOf("month").toDate(),
    };
  }, [budget]);

  const { data: summary, isLoading } = useQuery({
    queryKey: ["month-breakdown", payload],
    queryFn: () => getSummary(null, payload),
    onError,
  });

  const config = useMemo(() => {
    const conditioned = summary?.response
      ? Object.entries(summary.response.summary)
      : [];

    const option: EChartsOption = {
      series: {
        type: "sunburst",
        data: conditioned.map(([category, breakdown]) => ({
          name: category,
          itemStyle: {
            color: colors[breakdown.subCategories[0].color][7],
          },
          children: breakdown.subCategories.map((subc) => ({
            name: subc.label,
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
  }, [summary?.response]);

  const listDetails = useRef<ListDetailsHandle>(null);
  const handleClick = (e: SunBurstClickParams) => {
    listDetails.current?.update(e.treePathInfo);
  };

  return (
    <Box sx={{ height: "calc(100vh - 75px)" }} fz="sm">
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
      <Text ta="right" fz="xs" fs="italic" color="dimmed">
        Click on any segment to focus.
      </Text>
      <Divider my="xs" />
      <Text color="dimmed">
        Set Budget:{" "}
        <Text component="span" color={colors.gray[1]}>
          {formatCurrency(budget?.amount ?? 0)}
        </Text>
      </Text>
      {budget?.remarks && (
        <Text color="dimmed">
          Remarks for budget:{" "}
          <Text component="span" color={colors.gray[1]}>
            {budget.remarks}
          </Text>
        </Text>
      )}
      <Divider my="sm" />
      <ListDetails
        ref={listDetails}
        defaultTotal={summary?.response.total ?? 0}
        budget={budget?.amount ?? 0}
        month={budget?.month ?? 0}
        year={year}
      />
    </Box>
  );
}
