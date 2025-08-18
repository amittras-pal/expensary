import { ColDef } from "ag-grid-community";
import { dateFormatter } from "../../../utils";
import { AmountCell, CategoryCell, MetaCell } from "../plugins/cells";
import { CategoryFilter, SubCategoryFilter } from "../plugins/filters";
import { MetaHeader, RowCountHeader } from "../plugins/headers";

const rowMenuColumn: ColDef = {
  headerName: "",
  headerComponent: RowCountHeader,
  field: "_id",
  pinned: "left",
  maxWidth: 50,
  headerClass: "no-pad",
  cellStyle: {
    paddingLeft: 0,
    paddingRight: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

const rowSelectionColumn: ColDef = {
  headerName: "",
  field: "_id",
  maxWidth: 50,
  pinned: "left",
  headerClass: "no-pad",
  cellStyle: {
    paddingLeft: 0,
    paddingRight: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxSelection: true,
  headerCheckboxSelection: true,
};

const descriptionColumn: ColDef = {
  headerName: "Description",
  field: "description",
  maxWidth: 50,
  cellRenderer: MetaCell,
  cellRendererParams: { page: "budget" },
  headerComponent: MetaHeader,
  headerClass: "no-pad",
  cellStyle: {
    paddingLeft: 0,
    paddingRight: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
};

const titleColumn: ColDef = {
  headerName: "Title",
  field: "title",
};

const categoryColumn: ColDef = {
  headerName: "Category",
  field: "category.group",
  minWidth: 240,
  cellRenderer: CategoryCell,
  filter: CategoryFilter,
};

const subCategoryColumn: ColDef = {
  headerName: "Sub Category",
  colId: "category._id",
  field: "category.label",
  minWidth: 240,
  cellRenderer: CategoryCell,
  filter: SubCategoryFilter,
};

const amountColumn: ColDef = {
  headerName: "Amount",
  field: "amount",
  minWidth: 140,
  sortable: true,
  cellRenderer: AmountCell,
};

const dateColumn: ColDef = {
  headerName: "Date",
  field: "date",
  sortable: true,
  minWidth: 160,
  initialSort: "desc",
  valueFormatter: dateFormatter,
};

const coloumnConfigMap = {
  rowMenu: rowMenuColumn,
  rowSelection: rowSelectionColumn,
  description: descriptionColumn,
  title: titleColumn,
  category: categoryColumn,
  subCategory: subCategoryColumn,
  amount: amountColumn,
  date: dateColumn,
};

export default function generateColDef(
  defs: [keyof typeof coloumnConfigMap, ColDef][]
): ColDef[] {
  return defs.map((def) => ({
    ...coloumnConfigMap[def[0]],
    ...def[1],
  }));
}
