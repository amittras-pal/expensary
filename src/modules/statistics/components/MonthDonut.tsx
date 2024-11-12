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
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { useMediaMatch } from "../../../hooks/media-match";
import { formatCurrency, getPercentage } from "../../../utils";
import { ChartData } from "../types";

type MonthDonutProps = {
  data: ChartData;
  year: string;
  monthRange: [number, number];
  onNavigate: (e: 1 | -1) => void;
  onClose: () => void;
};

export default function MonthDonut(props: Readonly<MonthDonutProps>) {
  const { colors } = useMantineTheme();
  const isMobile = useMediaMatch();

  const [highlight, setHighlight] = useState<number>(0);

  const categories = useMemo(() => props.data.categories, [props.data]);
  const highlighted = useMemo(() => {
    const item = categories[highlight];
    const percentage = getPercentage(item.amount, props.data.total);
    return {
      amount: formatCurrency(item.amount),
      percentOfTotal: percentage <= 0 ? "<1%" : `~${percentage}%`,
    };
  }, [categories, highlight, props.data]);

  const onPieEnter = (_: any, index: number) => {
    setHighlight(index);
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
      <Group spacing="xs" align="flex-start">
        <Tooltip label={isMobile ? "Back to Year" : "Close"} position="bottom">
          <ActionIcon variant="subtle" onClick={props.onClose}>
            {isMobile ? <IconArrowLeft size={16} /> : <IconX size={16} />}
          </ActionIcon>
        </Tooltip>
        <Box>
          <Text sx={{ flexGrow: 1, flexShrink: 0 }} fw="bold">
            {dayjs()
              .month(props.data.month - 1)
              .format(isMobile ? "MMM" : "MMMM")}{" "}
            {dayjs().year(parseInt(props.year)).format("YYYY")}
          </Text>
          <Text fz="xs" fs="italic" color="dimmed">
            Share of expenses by category.
          </Text>
        </Box>
        <Tooltip label="Previous Month" position="bottom">
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
      <Box sx={{ height: "75.5%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="amount"
              data={categories}
              cx="50%"
              cy="50%"
              paddingAngle={2}
              stroke="none"
              innerRadius={70}
              activeIndex={highlight}
              activeShape={renderActiveShape}
              onMouseEnter={onPieEnter}
            >
              {categories.map((entry) => (
                <Cell key={entry.name} fill={colors[entry.color][7]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </Box>
      <Badge variant="light" color={categories[highlight].color} mb="xs">
        {categories[highlight].name}
      </Badge>
      <Text fz="sm">
        <Text component="span" color="dimmed">
          Amount:{" "}
        </Text>
        <Text component="span" fw="bold">
          {highlighted.amount}{" "}
        </Text>
        <Text component="span" color="dimmed" fs="italic">
          {highlighted.percentOfTotal} of total.
        </Text>
      </Text>
      <Text fz="sm">
        <Text component="span" color="dimmed">
          Set Budget:{" "}
        </Text>
        <Text component="span" fw="bold">
          {formatCurrency(props.data.budget)}
        </Text>
      </Text>
      <Text fz="sm">
        <Text component="span" color="dimmed">
          Overall Spent:{" "}
        </Text>
        <Text component="span" fw="bold">
          {formatCurrency(props.data.total)}
        </Text>
      </Text>
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
