import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import {
  IconArrowLeft,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { formatCurrency, getPercentage } from "../../../utils";
import { ChartData } from "../types";

type MonthSummaryProps = {
  data: ChartData;
  year: string;
  monthRange: [number, number];
  onNavigate: (e: 1 | -1) => void;
  onClose: () => void;
};

export default function MonthSummary(props: Readonly<MonthSummaryProps>) {
  const { colors } = useMantineTheme();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const chartData = useMemo(() => props.data.categories, [props.data]);
  const activeItem = useMemo(() => {
    const item = chartData[activeIndex];
    const percentage = getPercentage(item.amount, props.data.total);
    return {
      amount: formatCurrency(item.amount),
      percentOfTotal: percentage <= 0 ? "<1%" : `~${percentage}%`,
    };
  }, [chartData, activeIndex, props.data]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  useHotkeys([
    ["backspace", props.onClose],
    [
      "ArrowLeft",
      () => {
        if (props.data.month > props.monthRange[0]) props.onNavigate(-1);
      },
    ],
    [
      "ArrowRight",
      () => {
        if (props.data.month < props.monthRange[1]) props.onNavigate(1);
      },
    ],
  ]);

  return (
    <>
      <Group spacing="xs" align="center">
        <Tooltip label="Back to Year" position="bottom">
          <ActionIcon variant="subtle" onClick={props.onClose}>
            <IconArrowLeft size={16} />
          </ActionIcon>
        </Tooltip>
        <Text sx={{ flexGrow: 1, flexShrink: 0 }} fw="bold">
          {dayjs()
            .month(props.data.month - 1)
            .format("MMMM")}{" "}
          {dayjs().year(parseInt(props.year)).format("YYYY")}
        </Text>
        <Tooltip label={"Previous Month"} position="bottom">
          <ActionIcon
            ml="auto"
            variant="default"
            radius="xl"
            disabled={props.data.month === props.monthRange[0]}
            onClick={() => props.onNavigate(-1)}
          >
            <IconChevronLeft size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Next Month" position="bottom">
          <ActionIcon
            variant="default"
            radius="xl"
            disabled={props.data.month === props.monthRange[1]}
            onClick={() => props.onNavigate(1)}
          >
            <IconChevronRight size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Group spacing="xs" sx={{ height: "100%" }}>
        <Box sx={{ height: "100%", flex: 1 }}>
          <ResponsiveContainer width="100%" height="75%" style={{ flex: 2 }}>
            <PieChart>
              <Pie
                dataKey="amount"
                data={chartData}
                cx="50%"
                cy="50%"
                paddingAngle={2}
                stroke="none"
                innerRadius={70}
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                onMouseEnter={onPieEnter}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.category} fill={colors[entry.color][7]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <Badge variant="light" color={chartData[activeIndex].color} mb="xs">
            {chartData[activeIndex].category}
          </Badge>
          <Text>
            <Text component="span" color="dimmed">
              Amount:{" "}
            </Text>
            <Text component="span" fw="bold">
              {activeItem.amount}{" "}
            </Text>
            <Text component="span" color="dimmed" fs="italic" fz="sm">
              {activeItem.percentOfTotal} of total.
            </Text>
          </Text>
          <Text>
            <Text component="span" color="dimmed">
              Set Budget:{" "}
            </Text>
            <Text component="span" fw="bold">
              {formatCurrency(props.data.budget)}
            </Text>
          </Text>
          <Text>
            <Text component="span" color="dimmed">
              Overall Spent:{" "}
            </Text>
            <Text component="span" fw="bold">
              {formatCurrency(props.data.total)}
            </Text>
          </Text>
        </Box>
        {/* <Box sx={{ flex: 1 }}>Calendar Here.</Box> */}
      </Group>
    </>
  );
}

const renderActiveShape = (props: PieSectorDataItem) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius! + 6}
        outerRadius={outerRadius! + 10}
        fill={fill}
      />
    </g>
  );
};
