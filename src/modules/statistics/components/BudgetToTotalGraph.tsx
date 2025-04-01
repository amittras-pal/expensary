import { Box, Divider, Text, useMantineTheme } from "@mantine/core";
import { IconPoint } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "../../../utils";
import { ChartData } from "../types";
import { abbreviateNumber, monthFormatter } from "../utils";

export default function BudgetToTotalGraph(
  props: Readonly<{ data: ChartData[] }>
) {
  const { colors } = useMantineTheme();
  return (
    <ResponsiveContainer height="90%" width="100%">
      <LineChart data={props.data ?? []} margin={{ left: -24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={colors.dark[7]} />
        <XAxis
          dataKey="month"
          tickFormatter={monthFormatter}
          tick={{ fill: colors.gray[5], fontSize: "0.7rem" }}
        />
        <YAxis
          tickFormatter={abbreviateNumber}
          tick={{ fill: colors.gray[5], fontSize: "0.7rem" }}
        />
        <Tooltip
          content={<TooltipContent />}
          cursor={{
            stroke: colors.gray[6],
            strokeWidth: 6,
          }}
        />
        <Legend formatter={getLegend} style={{ fontSize: "0.7rem" }} />
        <Line
          type="monotone"
          dataKey="total"
          stroke={colors.gray[3]}
          dot={(dotProps) => dot({ ...dotProps, colors })}
        />
        <Line
          type="monotone"
          dataKey="budget"
          stroke={colors.dark[2]}
          strokeDasharray="3 3"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const dot = (props: any) => {
  const { cx, cy, payload, value, colors } = props;

  const dotColor = () => {
    if (value === payload.budget) return colors.blue[7];
    return value > payload.budget ? colors.red[7] : colors.green[7];
  };

  return (
    <IconPoint
      size={40}
      x={cx - 20}
      y={cy - 20}
      key={`${payload.month}-dot`}
      style={{ cursor: "pointer", color: dotColor() }}
    />
  );
};

const getLegend = (value: "total" | "budget") => {
  return value === "total" ? "Total Spent" : "Target Budget";
};

const TooltipContent = (props: any) => {
  const data = useMemo(() => {
    if (!props.payload.length) return null;
    return {
      budget:
        props?.payload?.find((obj: any) => obj.name === "budget")?.value ?? 0,
      total:
        props?.payload?.find((obj: any) => obj.name === "total")?.value ?? 0,
    };
  }, [props.payload]);

  if (props.active)
    return (
      <Box
        sx={(theme) => ({
          padding: theme.spacing.xs,
          borderRadius: theme.radius.md,
          boxShadow: theme.shadows.sm,
          backgroundColor: theme.colors.dark[5],
        })}
      >
        <Text fw="bold">
          {dayjs()
            .month(props.label - 1)
            .format("MMMM")}
        </Text>
        <Divider color="gray" my={4} />
        {data?.budget && data.budget > 0 ? (
          <>
            <Text fz="sm">Budget: {formatCurrency(data.budget)}</Text>
            <Text fz="sm" color={data.total > data.budget ? "red" : "green"}>
              Total Spent: {formatCurrency(data.total)}
            </Text>
          </>
        ) : (
          <Text fz="sm" fs="italic">
            Data not available.
          </Text>
        )}
      </Box>
    );

  return null;
};
