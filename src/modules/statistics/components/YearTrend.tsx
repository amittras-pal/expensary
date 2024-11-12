import {
  Box,
  Divider,
  Group,
  Loader,
  Select,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconCircleDotted, IconPoint } from "@tabler/icons-react";
import dayjs from "dayjs";
import { Dispatch, SetStateAction, useMemo } from "react";
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
import { CategoricalChartFunc } from "recharts/types/chart/generateCategoricalChart";
import { useCurrentUser } from "../../../context/user.context";
import { useMediaMatch } from "../../../hooks/media-match";
import { abbreviateNumber, formatCurrency } from "../../../utils";
import { ChartData } from "../types";

type YearTrendProps = {
  data: ChartData[] | null;
  onSelect: (e: number) => void;
  year: string;
  month: number;
  isLoading: boolean;
  disableChange: boolean;
  setYear: Dispatch<SetStateAction<string>>;
};

export default function YearTrend(props: Readonly<YearTrendProps>) {
  const { userData } = useCurrentUser();
  const { colors } = useMantineTheme();
  const isMobile = useMediaMatch();

  const yearOptions = useMemo(() => {
    const start = dayjs(userData?.createdAt).year();
    const end = dayjs().year();

    return [...Array(end - start + 1).keys()].map((v) =>
      (v + start).toString()
    );
  }, []);

  const onChartClick: CategoricalChartFunc = (e) => {
    if (e.activeTooltipIndex && props.data)
      if (props.data[e.activeTooltipIndex].budget > 0)
        props.onSelect(e.activeTooltipIndex);
  };

  if (props.isLoading)
    return (
      <Group position="center" align="center" sx={{ height: "100%" }}>
        <Loader size={50} />
      </Group>
    );

  return (
    <>
      <Group position="apart" mb="sm" align="center" spacing={0}>
        <Text sx={{ flexGrow: 1, flexShrink: 0 }} fw="bold">
          {props.year} @ a Glance
        </Text>
        <Select
          sx={{ flexGrow: 0, flexShrink: 1, flexBasis: "90px" }}
          value={props.year}
          onChange={(e) => props.setYear(e ?? "")}
          data={yearOptions}
          mb={0}
          autoFocus
          disabled={props.disableChange}
        />
      </Group>
      <ResponsiveContainer height="90%" width="100%">
        <LineChart
          data={props.data ?? []}
          margin={{ left: -24 }}
          onClick={onChartClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={colors.dark[7]} />
          <XAxis
            dataKey="month"
            tickFormatter={(value: number) => monthFormatter(value, isMobile)}
          />
          <YAxis tickFormatter={(value: number) => abbreviateNumber(value)} />
          <Tooltip
            content={<BudgetByTotalTooltip />}
            cursor={{
              stroke: colors.gray[6],
              strokeWidth: 6,
            }}
          />
          <Legend formatter={getLegend} />
          <Line
            type="monotone"
            dataKey="total"
            stroke={colors.gray[3]}
            dot={(dotProps) =>
              dot({ ...dotProps, colors, selection: props.month })
            }
          />
          <Line
            type="monotone"
            dataKey="budget"
            stroke={colors.dark[2]}
            strokeDasharray="3 3"
          />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}

const getLegend = (value: "total" | "budget") => {
  return value === "total" ? "Total Spent" : "Set Budget";
};

const monthFormatter = (value: number, isMobile: boolean) => {
  return dayjs()
    .month(value - 1)
    .format(isMobile ? "MMM" : "MMMM");
};

const dot = (props: any) => {
  const { cx, cy, payload, value, colors, selection } = props;
  const dotColor = () => {
    if (value === payload.budget) return colors.blue[7];
    return value > payload.budget ? colors.red[7] : colors.green[7];
  };

  return (
    <>
      {selection + 1 === payload.month && (
        <IconCircleDotted
          size={40}
          x={cx - 20}
          y={cy - 20}
          key={`${payload.month}-dot-active`}
          style={{ color: colors.blue[4] }}
        />
      )}
      <IconPoint
        size={40}
        x={cx - 20}
        y={cy - 20}
        key={`${payload.month}-dot`}
        style={{ cursor: "pointer", color: dotColor() }}
      />
    </>
  );
};

const BudgetByTotalTooltip = (props: any) => {
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
            <Divider color="gray" my={4} />
            <Text fz="xs" color="dimmed" fs="italic">
              Click to see details...
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
