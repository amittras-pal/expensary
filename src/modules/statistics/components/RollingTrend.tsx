import { Suspense, useCallback, useMemo, useState } from "react";
import {
  ActionIcon,
  Divider,
  Drawer,
  Flex,
  Select,
  Switch,
  Text,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useDocumentTitle } from "@mantine/hooks";
import {
  IconChartAreaLine,
  IconChevronLeft,
  IconChevronRight,
  IconTable,
  IconX,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import OverlayLoader from "../../../components/loaders/OverlayLoader";
import { APP_TITLE } from "../../../constants/app";
import { useErrorHandler } from "../../../hooks/error-handler";
import { useMediaMatch } from "../../../hooks/media-match";
import { getRollingStats } from "../../../services/statistics.service";
import { BarLineClickParams } from "../types";
import {
  PixelConvertibleChart,
  buildCategorySeries,
  isBudgetOrSpent,
  resolveClickedIndexFromPixel,
} from "../utils/chart-utils";
import MonthBreakdown from "./MonthBreakdown";
import RollingSummary from "./RollingSummary";

type Slot = { month: number; year: number };

export type RollingTrendOutletContext = {
  xAxisLabels: string[];
  budgets: { value: number }[];
  spends: {
    value: number;
    itemStyle: { color: string; borderWidth: number; borderColor: string };
  }[];
  yearChangeMarkers: { xAxis: number }[];
  loadingStats: boolean;
  showCategoryStack: boolean;
  categoriesSeries: Record<string, { value: number }[]>;
  categoryColorMap: Record<string, string>;
  handleChartClick: (event: BarLineClickParams, chart?: any) => void;
  tableMonthLabels: string[];
  tableBudgets: number[];
  tableSpends: number[];
  tableCategoriesSeries: Record<string, { value: number }[]>;
  handleTableCellClick: ({
    monthIndex,
    metric,
  }: {
    monthIndex: number;
    metric: string;
  }) => void;
};

export default function RollingTrend() {
  const [months, setMonths] = useState<number>(6);
  const [showCategoryStack, setShowCategoryStack] = useState<boolean>(false);
  const [focusIndex, setFocusIndex] = useState<number>(-1);
  const [focusCategory, setFocusCategory] = useState<string | null>(null);
  const [focusDrawerOpen, { open, close }] = useDisclosure(false, {
    onClose: () => {
      setFocusIndex(-1);
      setFocusCategory(null);
    },
  });
  const { onError } = useErrorHandler();
  const isMobile = useMediaMatch();
  const { colors } = useMantineTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const showTable = location.pathname.endsWith("/table");

  useDocumentTitle(
    `${APP_TITLE} | Analytics: ${showTable ? "Category Variation" : "Expense Trend"}`
  );

  // Compute the ordered month/year slots for the selected window.
  const slots = useMemo<Slot[]>(
    () =>
      Array.from({ length: months }, (_, i) => {
        const d = dayjs().subtract(months - 1 - i, "month");
        return { month: d.month() + 1, year: d.year() };
      }),
    [months]
  );

  const xAxisLabels = useMemo(
    () =>
      slots.map((s) =>
        dayjs()
          .month(s.month - 1)
          .year(s.year)
          .format("MMM 'YY")
      ),
    [slots]
  );

  const { data: statsRes, isLoading: loadingStats } = useQuery({
    queryKey: ["rolling-stats", months],
    queryFn: () => getRollingStats(months),
    onError,
  });

  const budgets = useMemo(
    () =>
      slots.map((s) => ({
        value:
          statsRes?.response.budgets.find(
            (b) => b.month === s.month && b.year === s.year
          )?.amount ?? 0,
      })),
    [statsRes?.response, slots]
  );

  const spends = useMemo(
    () =>
      slots.map((s, i) => {
        const value =
          statsRes?.response.trend.find(
            (t) => t.month === s.month && t.year === s.year
          )?.total ?? 0;

        let itemColor = colors.indigo[6];
        if (value > budgets[i].value) itemColor = colors.red[6];
        else if (value < budgets[i].value) itemColor = colors.green[6];

        return {
          value,
          itemStyle: {
            color: itemColor,
            borderWidth: 3,
            borderColor: colors.dark[6],
          },
        };
      }),
    [budgets, statsRes?.response, slots]
  );

  const budgetIndexRange = useMemo((): [number, number] => {
    const firstIndex = budgets.findIndex((b) => b.value > 0);
    const lastIndex = budgets.reduceRight((acc, b, idx) => {
      if (acc === -1 && b.value > 0) return idx;
      return acc;
    }, -1);
    return [firstIndex, lastIndex];
  }, [budgets]);

  const categoriesSeries = useMemo(() => {
    if (!statsRes) return {};

    return buildCategorySeries(statsRes.response.trend, slots);
  }, [statsRes?.response, slots]);

  const categoryColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    statsRes?.response.trend.forEach((month) => {
      month.categories.forEach((category) => {
        map[category.name] = category.color;
      });
    });
    return map;
  }, [statsRes?.response]);

  const tableMonthLabels = useMemo(() => xAxisLabels, [xAxisLabels]);

  const tableBudgets = useMemo(() => budgets.map((v) => v.value), [budgets]);

  const tableSpends = useMemo(() => spends.map((v) => v.value), [spends]);

  const tableCategoriesSeries = useMemo(
    () => categoriesSeries,
    [categoriesSeries]
  );

  // Midpoints between Dec and Jan where the year changes.
  const yearChangeMarkers = useMemo(
    () =>
      slots.reduce<{ xAxis: number }[]>((acc, s, i) => {
        if (i > 0 && s.year !== slots[i - 1].year) acc.push({ xAxis: i });
        return acc;
      }, []),
    [slots]
  );

  const handleChartClick = useCallback(
    (event: BarLineClickParams, chart?: PixelConvertibleChart) => {
      if (event.componentSubType !== "line") {
        return;
      }

      const clickedIndex =
        typeof event.dataIndex === "number"
          ? event.dataIndex
          : resolveClickedIndexFromPixel(event, chart);

      if (typeof clickedIndex !== "number") {
        return;
      }

      if (clickedIndex < 0 || clickedIndex >= budgets.length) {
        return;
      }

      const selectedBudget = budgets[clickedIndex]?.value ?? 0;
      if (selectedBudget <= 0) {
        return;
      }

      setFocusIndex(clickedIndex);
      setFocusCategory(
        isBudgetOrSpent(event.seriesName) ? null : event.seriesName
      );
      open();
    },
    [budgets, open]
  );

  const handleTableCellClick = useCallback(
    ({ monthIndex, metric }: { monthIndex: number; metric: string }) => {
      if (monthIndex < 0 || monthIndex >= slots.length) return;

      const isBudgetOrSpent = metric === "Budget" || metric === "Spent";
      setFocusIndex(monthIndex);
      setFocusCategory(isBudgetOrSpent ? null : metric);
      open();
    },
    [open, slots.length]
  );

  const outletContext = useMemo<RollingTrendOutletContext>(
    () => ({
      xAxisLabels,
      budgets,
      spends,
      yearChangeMarkers,
      loadingStats,
      showCategoryStack,
      categoriesSeries,
      categoryColorMap,
      handleChartClick,
      tableMonthLabels,
      tableBudgets,
      tableSpends,
      tableCategoriesSeries,
      handleTableCellClick,
    }),
    [
      xAxisLabels,
      budgets,
      spends,
      yearChangeMarkers,
      loadingStats,
      showCategoryStack,
      categoriesSeries,
      categoryColorMap,
      handleChartClick,
      tableMonthLabels,
      tableBudgets,
      tableSpends,
      tableCategoriesSeries,
      handleTableCellClick,
    ]
  );

  const focusSlot = focusIndex > -1 ? slots[focusIndex] : null;

  return (
    <>
      <Flex gap="sm" align="center" wrap="nowrap">
        <Select
          value={months.toString()}
          mb={0}
          size="xs"
          onChange={(v) => v && setMonths(Number.parseInt(v))}
          data={[
            { label: "6 Months", value: "6" },
            { label: "9 Months", value: "9" },
            { label: "1 Year", value: "12" },
            { label: "2 Years", value: "24" },
            // TODO
            // { label: "All Time", value: dayjs().diff(dayjs(userData?.createdAt), "months").toString()}
          ]}
          allowDeselect={false}
          style={{ width: 140 }}
        />
        {!showTable && (
          <Switch
            checked={showCategoryStack}
            onChange={(event) =>
              setShowCategoryStack(event.currentTarget.checked)
            }
            label="Show categories"
            size="xs"
          />
        )}
        <Flex ml="auto" gap="xs" align="center">
          <Tooltip label={showTable ? "Switch to chart" : "Switch to table"}>
            <ActionIcon
              size="md"
              variant="default"
              onClick={() =>
                navigate(showTable ? "/analytics" : "/analytics/table")
              }
            >
              {showTable ? (
                <IconChartAreaLine size={18} />
              ) : (
                <IconTable size={18} />
              )}
            </ActionIcon>
          </Tooltip>
          <RollingSummary
            months={months}
            spends={spends.map((v) => v.value)}
            budgets={budgets.map((v) => v.value)}
            slots={slots}
            mlAuto={false}
          />
        </Flex>
      </Flex>
      <Divider my="sm" style={{ width: "100%" }} />
      <Suspense fallback={<OverlayLoader visible />}>
        <Outlet context={outletContext} />
      </Suspense>
      <Drawer
        opened={focusDrawerOpen}
        onClose={close}
        position="right"
        withCloseButton={false}
        size={isMobile ? "100vw" : "50vw"}
      >
        <Flex justify={"space-between"} align={"center"} w={"100%"}>
          <Text mb={0} fz="lg">
            Breakdown for{" "}
            {focusSlot
              ? dayjs()
                  .month(focusSlot.month - 1)
                  .format("MMMM")
              : ""}
            , {focusSlot?.year ?? ""}
          </Text>
          <Flex gap={"xs"}>
            <Tooltip label="Previous month">
              <ActionIcon
                onClick={() =>
                  setFocusIndex((v) =>
                    v <= budgetIndexRange[0] ? v : Math.max(v - 1, 0)
                  )
                }
                radius={"xl"}
                variant="default"
                disabled={focusIndex === budgetIndexRange[0]}
              >
                <IconChevronLeft size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Next month">
              <ActionIcon
                onClick={() =>
                  setFocusIndex((v) =>
                    v >= budgetIndexRange[1]
                      ? v
                      : Math.min(v + 1, slots.length - 1)
                  )
                }
                radius={"xl"}
                variant="default"
                disabled={focusIndex === budgetIndexRange[1]}
              >
                <IconChevronRight size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Close">
              <ActionIcon onClick={close} radius={"xl"} variant="default">
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          </Flex>
        </Flex>
        {focusSlot && (
          <MonthBreakdown
            year={focusSlot.year}
            month={focusSlot.month}
            budget={
              statsRes?.response.budgets.find(
                (b) => b.month === focusSlot.month && b.year === focusSlot.year
              ) ?? null
            }
            initialCategory={focusCategory}
          />
        )}
      </Drawer>
    </>
  );
}
