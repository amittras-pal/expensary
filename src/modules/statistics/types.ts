import { YearStatsItem } from "../../services/response.type";

export type ChartData = YearStatsItem & { budget: number };
export type LegendSelection = Record<string, boolean>;
export type Selection = [string, boolean][];
