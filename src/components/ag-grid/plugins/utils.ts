import { SortDirection } from "ag-grid-community";

export function getNextSortOrder(current?: SortDirection): SortDirection {
  if (!current) return "asc";
  if (current === "asc") return "desc";
  return null;
}
