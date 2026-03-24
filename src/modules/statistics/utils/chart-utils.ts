import { BarLineClickParams } from "../types";

type SlotLike = { month: number; year: number };
type TrendCategoryLike = { name: string; amount: number };
type TrendMonthLike = {
  month: number;
  year: number;
  categories: TrendCategoryLike[];
};

type ZrPointerEvent = {
  offsetX?: number;
  offsetY?: number;
  event?: PointerEvent;
};

export type PixelConvertibleChart = {
  convertFromPixel: (
    finder: { seriesIndex?: number; xAxisIndex?: number },
    value: [number, number]
  ) => unknown;
};

function toSlotKey(month: number, year: number): string {
  return `${year}-${month}`;
}

function getPointXValue(axisPoint: unknown): number | null {
  if (Array.isArray(axisPoint) && Number.isFinite(axisPoint[0])) {
    return axisPoint[0] as number;
  }

  if (typeof axisPoint === "number" && Number.isFinite(axisPoint)) {
    return axisPoint;
  }

  return null;
}

function getClickOffsets(rawEvent: unknown): { offsetX: number; offsetY: number } | null {
  const zrEvent = rawEvent as ZrPointerEvent;
  const nativeEvent = zrEvent?.event;
  const offsetX =
    typeof zrEvent?.offsetX === "number" ? zrEvent.offsetX : nativeEvent?.offsetX;
  const offsetY =
    typeof zrEvent?.offsetY === "number" ? zrEvent.offsetY : nativeEvent?.offsetY;

  if (typeof offsetX !== "number" || typeof offsetY !== "number") {
    return null;
  }

  return { offsetX, offsetY };
}

export function resolveClickedIndexFromPixel(
  event: BarLineClickParams,
  chart?: PixelConvertibleChart
): number | null {
  if (!chart || !event.event) {
    return null;
  }

  const offsets = getClickOffsets(event.event);
  if (!offsets) {
    return null;
  }

  let axisPoint: unknown = Number.NaN;
  axisPoint = chart.convertFromPixel(
    { seriesIndex: event.seriesIndex ?? 0 },
    [offsets.offsetX, offsets.offsetY]
  );

  const firstAttempt = getPointXValue(axisPoint);
  if (firstAttempt !== null) {
    return Math.round(firstAttempt);
  }

  axisPoint = chart.convertFromPixel(
    { xAxisIndex: 0 },
    [offsets.offsetX, offsets.offsetY]
  );

  const fallbackAttempt = getPointXValue(axisPoint);
  return fallbackAttempt === null ? null : Math.round(fallbackAttempt);
}

export function buildCategorySeries(
  trend: TrendMonthLike[],
  slots: SlotLike[]
): Record<string, { value: number }[]> {
  const categoryNames = new Set<string>();
  const trendBySlotKey = new Map<string, TrendMonthLike>();

  for (const month of trend) {
    trendBySlotKey.set(toSlotKey(month.month, month.year), month);
    for (const category of month.categories) {
      categoryNames.add(category.name);
    }
  }

  const result: Record<string, { value: number }[]> = {};

  for (const categoryName of categoryNames) {
    result[categoryName] = [];

    for (const slot of slots) {
      const month = trendBySlotKey.get(toSlotKey(slot.month, slot.year));
      const category = month?.categories.find((entry) => entry.name === categoryName);
      result[categoryName].push({ value: category?.amount ?? 0 });
    }
  }

  return result;
}

export function isBudgetOrSpent(seriesName: string | undefined): boolean {
  return seriesName === "Budget" || seriesName === "Spent";
}