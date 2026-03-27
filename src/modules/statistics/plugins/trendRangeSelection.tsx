import { RefObject, useEffect, useMemo, useRef, useState } from "react";
import {
  Divider,
  Drawer,
  Flex,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react";
import { useMediaMatch } from "../../../hooks/media-match";
import { formatCurrency } from "../../../utils";

// Cell payload shape used by trend amount columns.
type TrendCellValue = {
  amount: number;
  delta: number | null;
};

// Generic row shape accepted by the range-selection hook.
type TrendRow = {
  metric: string;
  [key: string]: unknown;
};

// Concrete table coordinate used by the selection engine.
type RangeCell = {
  rowIndex: number;
  monthIndex: number;
};

// Selection is represented by a start/end pair; normalization handles drag direction.
type RangeSelection = {
  start: RangeCell;
  end: RangeCell;
};

// Drawer-level analytics generated per selected row.
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
  containerRef: RefObject<HTMLDivElement>;
};

type UseTrendRangeSelectionResult = {
  selection: RangeSelection | null;
  drawerOpened: boolean;
  summary: RangeSummaryEntry[];
  selectedMonthRange: SelectedMonthRange | null;
  handleCellMouseDown: (event: GridMouseCellEventLike) => void;
  handleCellMouseOver: (event: GridMouseCellEventLike) => void;
  shouldHandleCellClick: (event: GridClickedCellEventLike) => boolean;
  isCellInSelection: (
    rowIndex: number | null | undefined,
    field?: string
  ) => boolean;
  closeDrawer: () => void;
};

type GridMouseCellEventLike = {
  rowIndex: number | null | undefined;
  colDef: {
    field?: string;
  };
  event?: unknown;
};

type GridClickedCellEventLike = {
  colDef: {
    field?: string;
  };
};

type Point = {
  x: number;
  y: number;
};

// Drawer props for showing computed selection analytics.
type TrendRangeSummaryDrawerProps = {
  opened: boolean;
  onClose: () => void;
  summary: RangeSummaryEntry[];
  selectedRangeLabel: string;
};

// Touch/drag tuning values for initiating selection and edge auto-scroll.
const LONG_PRESS_MS = 350;
const MOVE_CANCEL_THRESHOLD = 8;
const EDGE_SCROLL_THRESHOLD = 36;
const EDGE_SCROLL_STEP = 14;

// Extract a normalized pointer location from native mouse events.
function toPointFromMouseEvent(event: MouseEvent): Point {
  return { x: event.clientX, y: event.clientY };
}

// Extract pointer location from ag-grid event wrappers when available.
function toPointFromUnknownEvent(event: unknown): Point | null {
  if (!event || typeof event !== "object") return null;

  const maybeEvent = event as { clientX?: unknown; clientY?: unknown };
  if (
    typeof maybeEvent.clientX === "number" &&
    typeof maybeEvent.clientY === "number"
  ) {
    return { x: maybeEvent.clientX, y: maybeEvent.clientY };
  }

  return null;
}

function getDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// Trend amount columns are keyed as m_0, m_1, ... and must be filtered explicitly.
function isAmountField(field?: string): field is `m_${number}` {
  return Boolean(field?.startsWith("m_"));
}

function parseMonthIndex(field?: string): number | null {
  if (!isAmountField(field)) return null;
  const monthIndex = Number.parseInt(field.slice(2), 10);
  return Number.isNaN(monthIndex) ? null : monthIndex;
}

// Normalize drag direction into deterministic row/column bounds.
function normalizeSelection(selection: RangeSelection) {
  const rowStart = Math.min(selection.start.rowIndex, selection.end.rowIndex);
  const rowEnd = Math.max(selection.start.rowIndex, selection.end.rowIndex);
  const colStart = Math.min(
    selection.start.monthIndex,
    selection.end.monthIndex
  );
  const colEnd = Math.max(selection.start.monthIndex, selection.end.monthIndex);

  return { rowStart, rowEnd, colStart, colEnd };
}

function toRangeCell(event: GridMouseCellEventLike): RangeCell | null {
  const field = event.colDef?.field;
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

// Build per-row summary tiles for the selected row/column rectangle.
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
    const startValue = values.at(0) ?? 0;
    const endValue = values.at(-1) ?? startValue;

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

// Main hook that coordinates drag selection, auto-scroll, summary calculation, and drawer state.
export function useTrendRangeSelection({
  enabled,
  rows,
  columnKeys,
  containerRef,
}: Readonly<UseTrendRangeSelectionArgs>): UseTrendRangeSelectionResult {
  const [selection, setSelection] = useState<RangeSelection | null>(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [summary, setSummary] = useState<RangeSummaryEntry[]>([]);

  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<RangeCell | null>(null);
  const movedDuringDragRef = useRef(false);
  const suppressNextClickRef = useRef(false);
  const longPressTimerRef = useRef<number | null>(null);
  const longPressStartPointRef = useRef<Point | null>(null);
  const activeTouchSelectionRef = useRef(false);
  const activeMouseSelectionRef = useRef(false);
  const lastPointerPointRef = useRef<Point | null>(null);
  const autoScrollFrameRef = useRef<number | null>(null);
  const selectionRef = useRef<RangeSelection | null>(null);
  const rowsRef = useRef(rows);
  const columnKeysRef = useRef(columnKeys);

  // Keep latest dynamic inputs in refs so global listeners always read fresh values.
  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    columnKeysRef.current = columnKeys;
  }, [columnKeys]);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current == null) return;
    globalThis.clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const stopAutoScroll = () => {
    if (autoScrollFrameRef.current == null) return;
    globalThis.cancelAnimationFrame(autoScrollFrameRef.current);
    autoScrollFrameRef.current = null;
  };

  // Resolve the ag-grid center/body viewport pair used for hit-testing and programmatic scroll.
  const findViewport = () => {
    const root = containerRef.current;
    if (!root) return null;

    const centerViewport = root.querySelector<HTMLElement>(
      ".ag-center-cols-viewport"
    );
    const bodyViewport = root.querySelector<HTMLElement>(".ag-body-viewport");

    if (!centerViewport || !bodyViewport) return null;

    return { centerViewport, bodyViewport };
  };

  const toCellFromPoint = (point: Point): RangeCell | null => {
    const root = containerRef.current;
    if (!root) return null;

    const resolveCell = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y) as HTMLElement | null;
      if (!element) return null;

      const cell = element.closest(".ag-cell") as HTMLElement | null;
      if (!cell || !root.contains(cell)) return null;
      return cell;
    };

    let cell = resolveCell(point.x, point.y);

    // When the finger moves outside the center viewport, clamp to the nearest
    // in-bounds point so range expansion can continue with edge auto-scroll.
    if (!cell) {
      const viewport = findViewport();
      const rect = viewport?.centerViewport.getBoundingClientRect();

      if (rect) {
        const clampedX = Math.min(
          Math.max(point.x, rect.left + 1),
          rect.right - 1
        );
        const clampedY = Math.min(
          Math.max(point.y, rect.top + 1),
          rect.bottom - 1
        );
        cell = resolveCell(clampedX, clampedY);
      }
    }

    if (!cell) return null;

    const field = cell.getAttribute("col-id") ?? undefined;
    const rowElement = cell.closest(".ag-row") as HTMLElement | null;
    const rowIndexAttr = rowElement?.getAttribute("row-index");
    const rowIndex =
      rowIndexAttr == null ? null : Number.parseInt(rowIndexAttr, 10);

    if (rowIndex == null || Number.isNaN(rowIndex)) return null;

    return toRangeCell({
      rowIndex,
      colDef: { field },
    });
  };

  const updateSelectionFromPoint = (point: Point) => {
    if (!isDraggingRef.current) return;

    const startCell = dragStartRef.current;
    const currentCell = toCellFromPoint(point);

    if (!startCell || !currentCell) return;

    if (!areSameCell(startCell, currentCell)) {
      movedDuringDragRef.current = true;
    }

    setSelection({ start: startCell, end: currentCell });
  };

  // Start a single auto-scroll loop and keep extending selection while pointer stays near edges.
  const ensureAutoScroll = () => {
    if (autoScrollFrameRef.current != null) return;

    const step = () => {
      if (
        !activeTouchSelectionRef.current &&
        !activeMouseSelectionRef.current
      ) {
        autoScrollFrameRef.current = null;
        return;
      }

      const point = lastPointerPointRef.current;
      const viewport = findViewport();

      if (!point || !viewport) {
        autoScrollFrameRef.current = globalThis.requestAnimationFrame(step);
        return;
      }

      const { centerViewport } = viewport;
      const rect = centerViewport.getBoundingClientRect();

      if (point.x <= rect.left + EDGE_SCROLL_THRESHOLD) {
        centerViewport.scrollLeft = Math.max(
          0,
          centerViewport.scrollLeft - EDGE_SCROLL_STEP
        );
      } else if (point.x >= rect.right - EDGE_SCROLL_THRESHOLD) {
        centerViewport.scrollLeft = Math.min(
          centerViewport.scrollWidth,
          centerViewport.scrollLeft + EDGE_SCROLL_STEP
        );
      }

      if (point.y <= rect.top + EDGE_SCROLL_THRESHOLD) {
        viewport.bodyViewport.scrollTop = Math.max(
          0,
          viewport.bodyViewport.scrollTop - EDGE_SCROLL_STEP
        );
      } else if (point.y >= rect.bottom - EDGE_SCROLL_THRESHOLD) {
        viewport.bodyViewport.scrollTop = Math.min(
          viewport.bodyViewport.scrollHeight,
          viewport.bodyViewport.scrollTop + EDGE_SCROLL_STEP
        );
      }

      updateSelectionFromPoint(point);
      autoScrollFrameRef.current = globalThis.requestAnimationFrame(step);
    };

    autoScrollFrameRef.current = globalThis.requestAnimationFrame(step);
  };

  // Reset selection + summary + drawer in one place so close/disable paths stay consistent.
  const clearSelection = () => {
    setSelection(null);
    setSummary([]);
    setDrawerOpened(false);
  };

  // Finalize drag, reject invalid ranges, and compute drawer summary for valid ranges.
  const finalizeDrag = () => {
    if (!enabled || !isDraggingRef.current) {
      isDraggingRef.current = false;
      dragStartRef.current = null;
      movedDuringDragRef.current = false;
      activeTouchSelectionRef.current = false;
      activeMouseSelectionRef.current = false;
      return;
    }

    const currentSelection = selectionRef.current;

    isDraggingRef.current = false;
    dragStartRef.current = null;
    activeTouchSelectionRef.current = false;
    activeMouseSelectionRef.current = false;
    stopAutoScroll();

    if (!currentSelection || !movedDuringDragRef.current) {
      movedDuringDragRef.current = false;
      return;
    }

    movedDuringDragRef.current = false;

    const { colStart, colEnd } = normalizeSelection(currentSelection);
    if (colStart === colEnd) {
      clearSelection();
      return;
    }

    const computedSummary = buildSummary(
      rowsRef.current,
      columnKeysRef.current,
      currentSelection
    );
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
      clearLongPressTimer();
      stopAutoScroll();
      activeTouchSelectionRef.current = false;
      activeMouseSelectionRef.current = false;
      longPressStartPointRef.current = null;
      lastPointerPointRef.current = null;
      isDraggingRef.current = false;
      dragStartRef.current = null;
      movedDuringDragRef.current = false;
      suppressNextClickRef.current = false;
    }
  }, [enabled]);

  // Desktop drag session: extend selection and autoscroll until mouse is released.
  useEffect(() => {
    if (!enabled) return undefined;

    const onMouseMove = (event: MouseEvent) => {
      if (!activeMouseSelectionRef.current) return;

      if ((event.buttons & 1) !== 1) {
        finalizeDrag();
        return;
      }

      const point = toPointFromMouseEvent(event);
      lastPointerPointRef.current = point;
      updateSelectionFromPoint(point);
      ensureAutoScroll();
      event.preventDefault();
    };

    const onMouseUp = () => {
      if (!activeMouseSelectionRef.current && !isDraggingRef.current) return;
      finalizeDrag();
    };

    globalThis.addEventListener("mousemove", onMouseMove);
    globalThis.addEventListener("mouseup", onMouseUp);
    return () => {
      globalThis.removeEventListener("mousemove", onMouseMove);
      globalThis.removeEventListener("mouseup", onMouseUp);
    };
  }, [enabled]);

  // Touch session: long-press enters selection mode, touch-move extends range, touch-end finalizes.
  useEffect(() => {
    if (!enabled) return undefined;

    const root = containerRef.current;
    if (!root) return undefined;

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;

      const touch = event.touches[0];
      const point = { x: touch.clientX, y: touch.clientY };
      const startCell = toCellFromPoint(point);

      activeTouchSelectionRef.current = false;
      lastPointerPointRef.current = point;
      clearLongPressTimer();

      if (!startCell) return;

      longPressStartPointRef.current = point;
      longPressTimerRef.current = globalThis.setTimeout(() => {
        activeTouchSelectionRef.current = true;
        dragStartRef.current = startCell;
        isDraggingRef.current = true;
        movedDuringDragRef.current = false;
        setSelection({ start: startCell, end: startCell });
        ensureAutoScroll();
      }, LONG_PRESS_MS);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;

      const touch = event.touches[0];
      const point = { x: touch.clientX, y: touch.clientY };
      lastPointerPointRef.current = point;

      if (!activeTouchSelectionRef.current) {
        const startPoint = longPressStartPointRef.current;
        if (!startPoint) return;

        const movedX = Math.abs(point.x - startPoint.x);
        const movedY = Math.abs(point.y - startPoint.y);
        if (movedX > MOVE_CANCEL_THRESHOLD || movedY > MOVE_CANCEL_THRESHOLD) {
          clearLongPressTimer();
          longPressStartPointRef.current = null;
        }
        return;
      }

      updateSelectionFromPoint(point);
      ensureAutoScroll();
      event.preventDefault();
    };

    const onTouchEnd = () => {
      clearLongPressTimer();
      longPressStartPointRef.current = null;
      stopAutoScroll();

      if (!activeTouchSelectionRef.current) {
        lastPointerPointRef.current = null;
        return;
      }

      activeTouchSelectionRef.current = false;
      lastPointerPointRef.current = null;
      finalizeDrag();
    };

    root.addEventListener("touchstart", onTouchStart, { passive: true });
    globalThis.addEventListener("touchmove", onTouchMove, { passive: false });
    globalThis.addEventListener("touchend", onTouchEnd);
    globalThis.addEventListener("touchcancel", onTouchEnd);

    return () => {
      clearLongPressTimer();
      stopAutoScroll();
      root.removeEventListener("touchstart", onTouchStart);
      globalThis.removeEventListener("touchmove", onTouchMove);
      globalThis.removeEventListener("touchend", onTouchEnd);
      globalThis.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [containerRef, enabled]);

  // Expose normalized month range for drawer subtitle.
  const selectedMonthRange = useMemo<SelectedMonthRange | null>(() => {
    if (!selection) return null;
    const { colStart, colEnd } = normalizeSelection(selection);
    return { startMonthIndex: colStart, endMonthIndex: colEnd };
  }, [selection]);

  const handleCellMouseDown = (event: GridMouseCellEventLike) => {
    if (!enabled) return;
    const startCell = toRangeCell(event);
    if (!startCell) return;

    const pointerPoint = toPointFromUnknownEvent(event.event);

    dragStartRef.current = startCell;
    isDraggingRef.current = true;
    activeMouseSelectionRef.current = true;
    activeTouchSelectionRef.current = false;
    movedDuringDragRef.current = false;
    if (pointerPoint) {
      lastPointerPointRef.current = pointerPoint;
    }

    setSelection({ start: startCell, end: startCell });
  };

  // Keep existing ag-grid mouseover selection updates for desktop compatibility.
  const handleCellMouseOver = (event: GridMouseCellEventLike) => {
    if (
      !enabled ||
      !isDraggingRef.current ||
      !activeMouseSelectionRef.current
    ) {
      return;
    }

    const startCell = dragStartRef.current;
    const currentCell = toRangeCell(event);

    if (!startCell || !currentCell) return;

    if (!areSameCell(startCell, currentCell)) {
      movedDuringDragRef.current = true;
    }

    setSelection({ start: startCell, end: currentCell });
    const pointerPoint = toPointFromUnknownEvent(event.event);
    if (pointerPoint) {
      lastPointerPointRef.current = pointerPoint;
      ensureAutoScroll();
    }
  };

  const shouldHandleCellClick = (event: GridClickedCellEventLike) => {
    if (!enabled) return true;

    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false;
      return false;
    }

    return isAmountField(event.colDef?.field);
  };

  // Used by table cellClass callback to highlight current rectangular selection.
  const isCellInSelection = (
    rowIndex: number | null | undefined,
    field?: string
  ) => {
    if (!enabled || !selection || rowIndex == null || rowIndex < 0)
      return false;

    const monthIndex = parseMonthIndex(field);
    if (monthIndex === null) return false;

    const { rowStart, rowEnd, colStart, colEnd } =
      normalizeSelection(selection);

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

export function TrendRangeSummaryDrawer({
  opened,
  onClose,
  summary,
  selectedRangeLabel,
}: Readonly<TrendRangeSummaryDrawerProps>) {
  const isMobile = useMediaMatch();

  // Compute display styles/icons outside JSX to keep render markup straightforward.
  const resolveDeltaView = (overallDelta: number | null) => {
    if (overallDelta == null) {
      return {
        deltaColor: "dimmed",
        hasDelta: false,
        DeltaIcon: IconArrowDown,
      };
    }

    if (overallDelta > 0) {
      return {
        deltaColor: "red",
        hasDelta: Math.abs(overallDelta) > 0,
        DeltaIcon: IconArrowUp,
      };
    }

    if (overallDelta < 0) {
      return {
        deltaColor: "green",
        hasDelta: true,
        DeltaIcon: IconArrowDown,
      };
    }

    return {
      deltaColor: "dimmed",
      hasDelta: false,
      DeltaIcon: IconArrowDown,
    };
  };

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
          const { deltaColor, hasDelta, DeltaIcon } = resolveDeltaView(
            entry.overallDelta
          );

          return (
            <Paper key={entry.metric} p="sm" withBorder radius="md" bg="dark.6">
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
