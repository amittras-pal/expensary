import {
  Box,
  Divider,
  Group,
  Loader,
  Select,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { IconPoint } from "@tabler/icons-react";
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

type YearSummaryProps = {
  data: ChartData[] | null;
  onSelect: (e: number) => void;
  year: string;
  isLoading: boolean;
  setYear: Dispatch<SetStateAction<string>>;
};

export default function YearSummary(props: Readonly<YearSummaryProps>) {
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
              onClick: (e) => console.log(e),
            }}
          />
          <Legend formatter={getLegend} />
          <Line
            type="natural"
            dataKey="total"
            stroke={colors.gray[3]}
            dot={(props) => Dot({ ...props, colors })}
          />
          <Line
            type="natural"
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

const Dot = (props: any) => {
  const { cx, cy, payload, value, colors } = props;

  return (
    <IconPoint
      size={40}
      x={cx - 20}
      y={cy - 20}
      key={payload.month}
      style={{
        cursor: "pointer",
        color: value > payload.budget ? colors.red[7] : colors.green[7],
      }}
    />
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

  if (props.active && data?.budget && data.total)
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
        <Text fz="sm">Budget: {formatCurrency(data.budget)}</Text>
        <Text fz="sm" color={data.total > data.budget ? "red" : "green"}>
          Total Spent: {formatCurrency(data.total)}
        </Text>
        <Divider color="gray" my={4} />
        <Text fz="xs" color="dimmed" fs="italic">
          Click to see details...
        </Text>
      </Box>
    );

  return null;
};
