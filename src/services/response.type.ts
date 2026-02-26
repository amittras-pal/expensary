import { MantineColor } from "@mantine/core";
import { BudgetForm } from "../schemas/schemas";

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
  budgets: BudgetForm[];
};

export type RollingStatsItem = {
  total: number;
  month: number;
  year: number;
  categories: CategoryStats[];
};

export type RollingStatsResponse = {
  trend: RollingStatsItem[];
  budgets: (BudgetForm & { year: number })[];
  months: number;
};
