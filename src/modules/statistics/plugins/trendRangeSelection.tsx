import { useEffect, useMemo, useRef, useState } from "react";
import { Divider, Drawer, Flex, Paper, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { useMediaMatch } from "../../../hooks/media-match";
import { formatCurrency } from "../../../utils";

type TrendCellValue = {
  amount: number;
  delta: number | null;
};

type TrendRow = {
  metric: string;
  [key: string]: unknown;
};

type RangeCell = {
  rowIndex: number;
  monthIndex: number;
};

type RangeSelection = {
  start: RangeCell;
  end: RangeCell;
};

type RangeSummaryEntry = {
  metric: string;
  total: number;
  max: number;
  min: number;
  average: number;
  overallDelta: number | null;
  selectedCount: number;
};

type SelectedMonthRange = {
  startMonthIndex: number;
  endMonthIndex: number;
};

type UseTrendRangeSelectionArgs = {
  enabled: boolean;
  rows: TrendRow[];
  columnKeys: string[];
};

type UseTrendRangeSelectionResult = {
  selection: RangeSelection | null;
  drawerOpened: boolean;
  summary: RangeSummaryEntry[];
  selectedMonthRange: SelectedMonthRange | null;
  handleCellMouseDown: (event: GridMouseCellEventLike) => void;
  handleCellMouseOver: (event: GridMouseCellEventLike) => void;
  shouldHandleCellClick: (event: GridClickedCellEventLike) => boolean;
  isCellInSelection: (rowIndex: number | null | undefined, field?: string) => boolean;
  closeDrawer: () => void;
};

type GridMouseCellEventLike = {
  rowIndex: number | null | undefined;
  colDef: {
    field?: string;
  };
};

type GridClickedCellEventLike = {
  colDef: {
    field?: string;
  };
};

function getDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function isAmountField(field?: string): field is `m_${number}` {
  return Boolean(field && field.startsWith("m_"));
}

function parseMonthIndex(field?: string): number | null {
  if (!isAmountField(field)) return null;
  const monthIndex = Number.parseInt(field.slice(2), 10);
  return Number.isNaN(monthIndex) ? null : monthIndex;
}

function normalizeSelection(selection: RangeSelection) {
  const rowStart = Math.min(selection.start.rowIndex, selection.end.rowIndex);
  const rowEnd = Math.max(selection.start.rowIndex, selection.end.rowIndex);
  const colStart = Math.min(selection.start.monthIndex, selection.end.monthIndex);
  const colEnd = Math.max(selection.start.monthIndex, selection.end.monthIndex);

  return { rowStart, rowEnd, colStart, colEnd };
}

function toRangeCell(
  event: GridMouseCellEventLike
): RangeCell | null {
  const field = event.colDef.field;
  const rowIndex = event.rowIndex;
  const monthIndex = parseMonthIndex(field);

  if (monthIndex === null || rowIndex == null || rowIndex < 0) return null;

  return { rowIndex, monthIndex };
}

function valuesForRow(
  row: TrendRow,
  columnKeys: string[],
  colStart: number,
  colEnd: number
): number[] {
  const values: number[] = [];
  for (let colIndex = colStart; colIndex <= colEnd; colIndex += 1) {
    const key = columnKeys[colIndex];
    if (!key) continue;
    const value = row[key] as TrendCellValue | undefined;
    if (typeof value?.amount === "number") values.push(value.amount);
  }
  return values;
}

function buildSummary(
  rows: TrendRow[],
  columnKeys: string[],
  selection: RangeSelection
): RangeSummaryEntry[] {
  const { rowStart, rowEnd, colStart, colEnd } = normalizeSelection(selection);
  const result: RangeSummaryEntry[] = [];

  for (let rowIndex = rowStart; rowIndex <= rowEnd; rowIndex += 1) {
    const row = rows[rowIndex];
    if (!row) continue;

    const values = valuesForRow(row, columnKeys, colStart, colEnd);
    if (!values.length) continue;

    const total = values.reduce((sum, value) => sum + value, 0);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const startValue = values[0];
    const endValue = values[values.length - 1];

    result.push({
      metric: row.metric,
      total,
      max,
      min,
      average: total / values.length,
      overallDelta: getDelta(endValue, startValue),
      selectedCount: values.length,
    });
  }

  return result;
}

function areSameCell(first: RangeCell, second: RangeCell): boolean {
  return (
    first.rowIndex === second.rowIndex && first.monthIndex === second.monthIndex
  );
}

export function useTrendRangeSelection({
  enabled,
  rows,
  columnKeys,
}: Readonly<UseTrendRangeSelectionArgs>): UseTrendRangeSelectionResult {
  const [selection, setSelection] = useState<RangeSelection | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [summary, setSummary] = useState<RangeSummaryEntry[]>([]);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<RangeCell | null>(null);
  const movedDuringDragRef = useRef(false);
  const suppressNextClickRef = useRef(false);

  const clearSelection = () => {
    setSelection(null);
    setSummary([]);
    setDrawerOpened(false);
  };

  const finalizeDrag = () => {
    if (!enabled || !isDraggingRef.current) {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      movedDuringDragRef.current = false;
      return;
    }

    const currentSelection = selection;

    isDraggingRef.current = false;
    dragStartRef.current = null;

    if (!currentSelection || !movedDuringDragRef.current) {
      movedDuringDragRef.current = false;
      return;
    }

    movedDuringDragRef.current = false;

    const computedSummary = buildSummary(rows, columnKeys, currentSelection);
    if (!computedSummary.length) {
      clearSelection();
      return;
    }

    setSummary(computedSummary);
    setDrawerOpened(true);
    suppressNextClickRef.current = true;
  };

  useEffect(() => {
    if (!enabled) {
      clearSelection();
      isDraggingRef.current = false;
      dragStartRef.current = null;
      movedDuringDragRef.current = false;
      suppressNextClickRef.current = false;
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    const onMouseUp = () => finalizeDrag();

    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [columnKeys, enabled, rows, selection]);

  const selectedMonthRange = useMemo<SelectedMonthRange | null>(() => {
    if (!selection) return null;
    const { colStart, colEnd } = normalizeSelection(selection);
    return { startMonthIndex: colStart, endMonthIndex: colEnd };
  }, [selection]);

  const handleCellMouseDown = (event: GridMouseCellEventLike) => {
    if (!enabled) return;
    const startCell = toRangeCell(event);
    if (!startCell) return;

    dragStartRef.current = startCell;
    isDraggingRef.current = true;
    movedDuringDragRef.current = false;

    setSelection({ start: startCell, end: startCell });
  };

  const handleCellMouseOver = (event: GridMouseCellEventLike) => {
    if (!enabled || !isDraggingRef.current) return;

    const startCell = dragStartRef.current;
    const currentCell = toRangeCell(event);

    if (!startCell || !currentCell) return;

    if (!areSameCell(startCell, currentCell)) {
      movedDuringDragRef.current = true;
    }

    setSelection({ start: startCell, end: currentCell });
  };

  const shouldHandleCellClick = (event: GridClickedCellEventLike) => {
    if (!enabled) return true;

    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return false;
    }

    return isAmountField(event.colDef.field);
  };

  const isCellInSelection = (rowIndex: number | null | undefined, field?: string) => {
    if (!enabled || !selection || rowIndex == null || rowIndex < 0) return false;

    const monthIndex = parseMonthIndex(field);
    if (monthIndex === null) return false;

    const { rowStart, rowEnd, colStart, colEnd } = normalizeSelection(selection);

    return (
      rowIndex >= rowStart &&
      rowIndex <= rowEnd &&
      monthIndex >= colStart &&
      monthIndex <= colEnd
    );
  };

  return {
    selection,
    drawerOpened,
    summary,
    selectedMonthRange,
    handleCellMouseDown,
    handleCellMouseOver,
    shouldHandleCellClick,
    isCellInSelection,
    closeDrawer: clearSelection,
  };
}

type TrendRangeSummaryDrawerProps = {
  opened: boolean;
  onClose: () => void;
  summary: RangeSummaryEntry[];
  selectedRangeLabel: string;
};

export function TrendRangeSummaryDrawer({
  opened,
  onClose,
  summary,
  selectedRangeLabel,
}: Readonly<TrendRangeSummaryDrawerProps>) {
  const isMobile = useMediaMatch();

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position={isMobile ? "bottom" : "right"}
      size={isMobile ? "min(55vh, 420px)" : "min(40vw, 560px)"}
      title="Selected trend range"
    >
      <Stack gap="sm">
        <Text c="dimmed" size="sm">
          {selectedRangeLabel}
        </Text>
        <Divider />
        {summary.map((entry) => {
          const deltaColor =
            entry.overallDelta == null
              ? "dimmed"
              : entry.overallDelta > 0
                ? "red"
                : entry.overallDelta < 0
                  ? "green"
                  : "dimmed";
          const hasDelta =
            typeof entry.overallDelta === "number" &&
            Math.abs(entry.overallDelta) > 0;
          const DeltaIcon =
            entry.overallDelta != null && entry.overallDelta > 0
              ? IconArrowUp
              : IconArrowDown;

          return (
            <Paper
              key={entry.metric}
              p="sm"
              withBorder
              radius="md"
              bg="dark.6"
            >
              <Flex justify="space-between" align="center" gap="sm">
                <Text fw={700}>{entry.metric}</Text>
                <Text c="dimmed" size="xs">
                  {entry.selectedCount} value
                  {entry.selectedCount === 1 ? "" : "s"}
                </Text>
              </Flex>
              <Flex justify="space-between" align="center" mt="xs" gap="sm">
                <Text size="sm" c="dimmed">
                  Total
                </Text>
                <Text fw={600}>{formatCurrency(entry.total)}</Text>
              </Flex>
              <Flex justify="space-between" align="center" mt={4} gap="sm">
                <Text size="sm" c="dimmed">
                  Max
                </Text>
                <Text fw={600}>{formatCurrency(entry.max)}</Text>
              </Flex>
              <Flex justify="space-between" align="center" mt={4} gap="sm">
                <Text size="sm" c="dimmed">
                  Min
                </Text>
                <Text fw={600}>{formatCurrency(entry.min)}</Text>
              </Flex>
              <Flex justify="space-between" align="center" mt={4} gap="sm">
                <Text size="sm" c="dimmed">
                  Avg
                </Text>
                <Text fw={600}>{formatCurrency(entry.average)}</Text>
              </Flex>
              <Flex justify="space-between" align="center" mt={4} gap="sm">
                <Text size="sm" c="dimmed">
                  Overall delta
                </Text>
                {entry.overallDelta == null ? (
                  <Text fw={600} c={deltaColor}>
                    N/A
                  </Text>
                ) : (
                  <Flex align="center" gap={2}>
                    {hasDelta && (
                      <ThemeIcon c={deltaColor} variant="transparent" size="sm">
                        <DeltaIcon size={14} />
                      </ThemeIcon>
                    )}
                    <Text fw={600} c={deltaColor}>
                      {Math.abs(entry.overallDelta).toFixed(1)}%
                    </Text>
                  </Flex>
                )}
              </Flex>
            </Paper>
          );
        })}
      </Stack>
    </Drawer>
  );
}