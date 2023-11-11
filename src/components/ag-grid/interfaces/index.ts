import { ICellRendererParams, INoRowsOverlayParams } from "ag-grid-community";

export interface MetaCellProps extends ICellRendererParams<IExpense, string> {
  page: "budget" | "plan";
}

export interface MenuCellProps extends ICellRendererParams<IExpense> {
  onEditExpense: (e: IExpense | undefined, index: number) => void;
  onDeleteExpense: (e: IExpense | undefined) => void;
  plan: IExpensePlan;
}

export interface NoDataOverlayProps extends INoRowsOverlayParams<IExpense> {
  message: string;
}

export interface SubCategoryOption {
  children: ICategory[];
  group: string;
}
