import {
    Box,
    Divider,
    Group,
    List,
    Text,
    ThemeIcon,
    useMantineTheme,
  } from "@mantine/core";
  import { IconPointFilled } from "@tabler/icons-react";
  import dayjs from "dayjs";
  import { useMemo } from "react";
  import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
  } from "recharts";
  import { useMediaMatch } from "../../../hooks/media-match";
  import { formatCurrency } from "../../../utils";
  import { ChartData } from "../types";
  import { abbreviateNumber, monthFormatter } from "../utils";
  
  export default function BudgetToCategoryGraph(
    props: Readonly<{ data: ChartData[] }>
  ) {
    const { colors } = useMantineTheme();
    const isMobile = useMediaMatch();
  
    const { data, categories } = useMemo(() => {
      const data = props.data?.map((entry) => ({
        month: entry.month,
        budget: entry.budget,
        total: entry.total,
        ...entry.categories.reduce(
          (collection, category) => ({
            ...collection,
            [category.name]: category.amount,
          }),
          {}
        ),
      }));
      const categories =
        props.data
          ?.flatMap((entry) =>
            entry.categories.map((c) => ({ [c.name]: c.color }))
          )
          .reduce((collection, e) => {
            const [category, color] = Object.entries(e)[0];
            return { ...collection, [category]: color };
          }) ?? {};
  
      return { data, categories };
    }, [props.data]);
  
    return (
      <ResponsiveContainer height="95%" width="100%">
        <BarChart data={data ?? []} margin={{ left: -24 }}>
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
            cursor={{ stroke: colors.gray[9], strokeWidth: 5 }}
          />
          <Bar
            dataKey="budget"
            stackId="budget"
            fill={colors.gray[6]}
            barSize={isMobile ? 2 : 4}
          />
          <Bar
            dataKey="total"
            stackId="total"
            fill={colors.blue[6]}
            barSize={isMobile ? 2 : 4}
          />
          {Object.keys(categories).map((category) => (
            <Bar
              dataKey={category}
              stackId="category"
              fill={colors[categories[category]][5]}
              barSize={isMobile ? 10 : 25}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }
  
  const TooltipContent = (props: any) => {
    const render = useMemo(() => {
      const budget =
        props.payload.find((e: any) => e.name === "budget")?.value ?? 0;
      const total =
        props.payload.find((e: any) => e.name === "total")?.value ?? 0;
      const stack = props.payload.filter(
        (p: any) => !["budget", "total"].includes(p.name)
      );
  
      return { budget, total, stack };
    }, [props.payload]);
  
    return (
      <Box
        sx={(theme) => ({
          padding: theme.spacing.xs,
          borderRadius: theme.radius.md,
          boxShadow: theme.shadows.sm,
          backgroundColor: theme.colors.dark[5],
        })}
      >
        <Group position="apart">
          <Text fw="bold" fz="sm">
            {dayjs()
              .month(props.label - 1)
              .format("MMMM")}
          </Text>
          {render.budget > 0 && (
            <Text fz="sm">Budget: {formatCurrency(render.budget)}</Text>
          )}
        </Group>
        <Divider color="gray" my={4} />
        {(render.stack.length ?? 0) > 0 ? (
          <>
            <List>
              {render.stack.map((entry: any) => (
                <List.Item
                  icon={
                    <ThemeIcon color={entry.fill} size={18} radius="xl">
                      <IconPointFilled size={14} />
                    </ThemeIcon>
                  }
                >
                  <Text color={entry.fill} fz="sm">
                    {entry.name}: {formatCurrency(entry.value)}
                  </Text>
                </List.Item>
              ))}
            </List>
            <Divider color="gray" my={4} />
            <Text fz="sm" fs="italic">
              Total Spent: {formatCurrency(render.total)}
            </Text>
          </>
        ) : (
          <Text fz="sm" fs="italic">
            Data not available.
          </Text>
        )}
      </Box>
    );
  };
  