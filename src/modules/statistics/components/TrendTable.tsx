import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Box } from "@mantine/core";
import {
  CellClassParams,
  CellClickedEvent,
  ColDef,
  RowClassParams,
} from "ag-grid-community";
import AgGridMod from "../../../components/ag-grid/AgGridMod";
import {
  TrendAmountCell,
  TrendMetricCell,
} from "../../../components/ag-grid/plugins/cells";
import {
  TrendRangeSummaryDrawer,
  useTrendRangeSelection,
} from "../plugins/trendRangeSelection";

type TrendRow = {
  metric: string;
  isSummary: boolean;
  color?: string;
  [key: string]: unknown;
};

type Props = {
  monthLabels: string[];
  budgets: number[];
  spends: number[];
  categoriesSeries: Record<string, { value: number }[]>;
  categoryColorMap: Record<string, string>;
  onAmountCellClick?: (payload: { monthIndex: number; metric: string }) => void;
};

function getDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

const ENABLE_RANGE_SELECTION = true;

export default function TrendTable({
  monthLabels,
  budgets,
  spends,
  categoriesSeries,
  categoryColorMap,
  onAmountCellClick,
}: Readonly<Props>) {
  const ref = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateHeight = () => setContainerHeight(element.clientHeight);
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const columnKeys = useMemo(
    () => monthLabels.map((_, idx) => `m_${idx}`),
    [monthLabels]
  );

  const rows = useMemo<TrendRow[]>(() => {
    const toRow = (
      metric: string,
      values: number[],
      isSummary: boolean,
      color?: string
    ): TrendRow => {
      const row: TrendRow = { metric, isSummary, color };
      values.forEach((current, idx) => {
        const isFirst = idx === 0;
        const previous = isFirst ? null : values[idx - 1];
        const delta = previous === null ? null : getDelta(current, previous);
        row[columnKeys[idx]] = { amount: current, delta };
      });
      return row;
    };

    const categoryRows = Object.entries(categoriesSeries).map(
      ([name, values]) =>
        toRow(
          name,
          values.map((v) => v.value),
          false,
          categoryColorMap[name]
        )
    );

    return [
      toRow("Budget", budgets, true),
      toRow("Spent", spends, true),
      ...categoryRows,
    ];
  }, [budgets, categoriesSeries, categoryColorMap, columnKeys, spends]);

  const rowClassRules = useMemo(
    () => ({
      "trend-row-budget": (params: RowClassParams<TrendRow>) =>
        params.data?.metric === "Budget",
      "trend-row-spent": (params: RowClassParams<TrendRow>) =>
        params.data?.metric === "Spent",
    }),
    []
  );

  const {
    drawerOpened,
    summary,
    selectedMonthRange,
    handleCellMouseDown,
    handleCellMouseOver,
    shouldHandleCellClick,
    isCellInSelection,
    closeDrawer,
  } = useTrendRangeSelection({
    enabled: ENABLE_RANGE_SELECTION,
    rows,
    columnKeys,
    containerRef: ref,
  });

  const selectedRangeLabel = useMemo(() => {
    if (!selectedMonthRange) return "No range selected";

    const startLabel = monthLabels[selectedMonthRange.startMonthIndex];
    const endLabel = monthLabels[selectedMonthRange.endMonthIndex];
    if (!startLabel || !endLabel) return "No range selected";

    if (startLabel === endLabel) return startLabel;

    return `Analytics for Selection: ${startLabel} - ${endLabel}`;
  }, [monthLabels, selectedMonthRange]);

  const getAmountCellClass = (label: string) => {
    const yearEndClass = label.startsWith("Dec") ? "trend-year-end-col" : "";

    return (params: CellClassParams<TrendRow>) => {
      const selected = isCellInSelection(params.rowIndex, params.colDef.field)
        ? "trend-cell-selected"
        : "";

      return [yearEndClass, selected].filter(Boolean).join(" ");
    };
  };

  const columns = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Metric",
        field: "metric",
        pinned: "left",
        lockPinned: true,
        minWidth: 180,
        maxWidth: 220,
        sortable: false,
        filter: false,
        cellRenderer: TrendMetricCell,
      },
      ...monthLabels.map((label, idx) => ({
        headerName: label,
        field: columnKeys[idx],
        minWidth: 175,
        sortable: false,
        filter: false,
        headerClass: label.startsWith("Dec") ? "trend-year-end-col" : "",
        cellClass: getAmountCellClass(label),
        cellRenderer: TrendAmountCell,
      })),
    ],
    [columnKeys, monthLabels, isCellInSelection]
  );

  const handleCellClick = (event: CellClickedEvent<TrendRow>) => {
    if (ENABLE_RANGE_SELECTION && !shouldHandleCellClick(event)) return;

    const field = event.colDef.field;
    const metric = event.data?.metric;

    if (!field || field === "metric" || !metric) return;
    if (!field.startsWith("m_")) return;

    const monthIndex = Number.parseInt(field.slice(2), 10);
    if (Number.isNaN(monthIndex)) return;

    onAmountCellClick?.({ monthIndex, metric });
  };

  return (
    <Box style={{ width: "100%", height: "calc(100vh - 150px)" }} ref={ref}>
      {containerHeight > 0 && (
        <AgGridMod
          className="stats-table"
          columnDefs={columns}
          rowData={rows}
          rowClassRules={rowClassRules}
          onCellClicked={handleCellClick}
          onCellMouseDown={handleCellMouseDown}
          onCellMouseOver={handleCellMouseOver}
          height={containerHeight}
        />
      )}
      <TrendRangeSummaryDrawer
        opened={drawerOpened}
        onClose={closeDrawer}
        summary={summary}
        selectedRangeLabel={selectedRangeLabel}
      />
    </Box>
  );
}
