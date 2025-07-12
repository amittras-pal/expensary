import { MantineColor } from "@mantine/core";
import { SortDirection } from "ag-grid-community";

export function getNextSortOrder(current?: SortDirection): SortDirection {
  if (!current) return "asc";
  if (current === "asc") return "desc";
  return null;
}

export function amountColor(num: number): MantineColor | "dimmed" {
  if (num === 0) return "dimmed";
  else if (num > 0) return "red";
  else return " green";
}
