import { YearStatsItem } from "../../services/response.type";

export type ChartData = YearStatsItem & { budget: number };
export type LegendSelection = Record<string, boolean>;
export type Selection = [string, boolean][];

export type BarLineClickParams = {
  borderColor: string;
  color: string;
  componentIndex: number;
  componentSubType: "line" | "bar"; // determine if the click was on the line or the bar segment.
  componentType: string;
  dataIndex: number; // translates to month for us,
  seriesName: string;
  seriesType: "line" | "bar";
  type: "click";
  value: "number";
  event: { event: PointerEvent };
};

export type TreePathInfo = { name: string; dataIndex: number; value: number };
export type SunBurstClickParams = {
  borderColor: string;
  color: string;
  componentIndex: number;
  componentSubType: "sunburst";
  componentType: string;
  data: {
    name: string;
    children: { name: string; value: number }[];
  };
  dataIndex: number;
  event: { event: PointerEvent };
  name: string;
  seriesIndex: number;
  seriesType: "sunburst";
  treePathInfo: TreePathInfo[];
  value: number;
};
