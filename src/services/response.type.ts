import { MantineColor } from "@mantine/core";

export type ResponseBody<T> = {
  message: string;
  response: T;
};

export type SummaryResponse = {
  summary: Record<string, SummaryItem>;
  total: number;
};

export type CategoryStats = {
  amount: number;
  items: number;
  name: string;
  color: MantineColor;
};

export type YearStatsItem = {
  total: number;
  month: number;
  categories: CategoryStats[];
};

export type YearStatsResponse = {
  trend: YearStatsItem[];
  budgets: { month: number; amount: number }[];
};
