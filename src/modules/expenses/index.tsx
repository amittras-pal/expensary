import {
  Box,
  Divider,
  Group,
  LoadingOverlay,
  Modal,
  Text,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useDisclosure, useDocumentTitle, useHotkeys } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ColDef, FilterChangedEvent, GridApi } from "ag-grid-community";
import dayjs from "dayjs";
import { useCallback, useMemo, useRef, useState } from "react";
import DeleteExpense from "../../components/DeleteExpense";
import ExpenseForm from "../../components/ExpenseForm";
import AgGridMod from "../../components/ag-grid/AgGridMod";
import {
  AmountCell,
  CategoryCell,
  MetaCell,
  RowMenuCell,
} from "../../components/ag-grid/plugins/cells";
import {
  CategoryFilter,
  SubCategoryFilter,
} from "../../components/ag-grid/plugins/filters";
import {
  MetaHeader,
  RowCountHeader,
} from "../../components/ag-grid/plugins/headers";
import { APP_TITLE } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import { getBudget } from "../../services/budget.service";
import { getExpenseList } from "../../services/expense.service";
import { dateFormatter, formatCurrency } from "../../utils";

interface ExpenseAtRow extends IExpense {
  index: number;
}

export default function Expenses() {
  useDocumentTitle(`${APP_TITLE} | Expenses List`);
  const { userData } = useCurrentUser();
  const { onError } = useErrorHandler();

  const isMobile = useMediaMatch();

  const client = useQueryClient();

  const [showForm, formModal] = useDisclosure(false);
  const [confirm, deleteModal] = useDisclosure(false);

  const [targetExpense, setTargetExpense] = useState<ExpenseAtRow | null>(null);
  const [filterTotal, setFilterTotal] = useState(0);
  const [grid, setGrid] = useState<GridApi<IExpense> | null>(null);
  const [payload, setPayload] = useState({
    startDate: dayjs().startOf("month").toDate(),
    endDate: dayjs().endOf("month").toDate(),
    sort: { date: -1 },
  });

  const clearFilters = () => {
    grid?.destroyFilter("category.group");
    grid?.destroyFilter("category._id");
  };

  useHotkeys([["x", clearFilters]]);

  const ref = useRef<HTMLDivElement>(null);
  const { data: listRes, isLoading: loadingList } = useQuery({
    queryKey: ["list", payload],
    queryFn: () => getExpenseList(payload),
    refetchOnWindowFocus: false,
    onSuccess: (res) => {
      clearFilters();
      const total =
        res?.response?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
      setFilterTotal(total);
    },
    onError,
  });

  const { data: budgetRes, isLoading: loadingBudget } = useQuery({
    queryKey: ["budget", payload],
    queryFn: () =>
      getBudget({
        month: dayjs(payload.startDate).month(),
        year: dayjs(payload.startDate).year(),
      }),
    onError,
  });

  const handleClose = (refreshData: IExpense | boolean) => {
    if (showForm) formModal.close();
    if (confirm) deleteModal.close();
    if (refreshData && typeof refreshData === "object") {
      const update: IExpense = {
        ...refreshData,
        category: refreshData.categoryId as unknown as ICategory,
        categoryId: (refreshData.categoryId as unknown as ICategory)._id ?? "",
      };
      const node = grid?.getDisplayedRowAtIndex(targetExpense?.index ?? 0);
      if (node) {
        const flashCols: string[] = Object.entries(node?.data ?? {}).reduce(
          (columns: string[], field) => {
            const [key, data] = field;
            if (key === "category") {
              if (update[key]?.group !== data.group)
                columns.push("category.group");
              if (update[key]?.label !== data.label)
                columns.push("category._id");
              // @ts-ignore
            } else if (update[key] !== data) {
              columns.push(key);
            }
            return columns;
          },
          []
        );

        node.setData(update);
        grid?.flashCells({ rowNodes: [node], columns: flashCols });
      }
    } else if (refreshData && typeof refreshData === "boolean")
      client.invalidateQueries(["list", payload]);

    setTimeout(() => {
      setTargetExpense(null);
    }, 1000);
  };

  const editExpense = useCallback(
    (target: IExpense, index: number) => {
      setTargetExpense({ ...target, index });
      formModal.open();
    },
    [formModal]
  );

  const deleteExpense = useCallback(
    (target: IExpense, index: number) => {
      setTargetExpense({ ...target, index });
      deleteModal.open();
    },
    [deleteModal]
  );

  const columns = useMemo((): ColDef[] => {
    return [
      {
        headerName: "",
        headerComponent: RowCountHeader,
        cellRenderer: RowMenuCell,
        cellRendererParams: {
          onEditExpense: editExpense,
          onDeleteExpense: deleteExpense,
        },
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
      },
      {
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
      },
      {
        headerName: "Title",
        field: "title",
        minWidth: isMobile ? 240 : 320,
      },
      {
        headerName: "Category",
        field: "category.group",
        minWidth: 240,
        cellRenderer: CategoryCell,
        filter: CategoryFilter,
      },
      {
        headerName: "Sub Category",
        colId: "category._id",
        field: "category.label",
        minWidth: 240,
        cellRenderer: CategoryCell,
        filter: SubCategoryFilter,
      },
      {
        headerName: "Amount",
        field: "amount",
        minWidth: 140,
        sortable: true,
        cellRenderer: AmountCell,
      },
      {
        headerName: "Date",
        field: "date",
        sortable: true,
        minWidth: 160,
        initialSort: "desc",
        valueFormatter: dateFormatter,
      },
    ];
  }, [isMobile, deleteExpense, editExpense]);

  const updateFilterTotal = (grid: FilterChangedEvent<IExpense>) => {
    let total = 0;
    grid.api.forEachNodeAfterFilter((node) => {
      total += node.data?.amount ?? 0;
    });
    setFilterTotal(total);
  };

  const handleMonthChange = (e: Date) => {
    setPayload((prev) => ({
      ...prev,
      startDate: dayjs(e).startOf("month").toDate(),
      endDate: dayjs(e).endOf("month").toDate(),
      sort: { date: -1 },
    }));
  };

  return (
    <>
      <Group
        spacing={0}
        sx={{ flexDirection: "column", height: "100%" }}
        position="left"
        align="flex-start"
      >
        <Group spacing="xs" sx={{ width: "100%" }}>
          <MonthPickerInput
            size="xs"
            sx={{ flexGrow: 1, textAlign: "center" }}
            placeholder="Select month"
            variant="filled"
            value={payload.startDate}
            valueFormat="MMM 'YY"
            onChange={handleMonthChange}
            maxDate={dayjs().toDate()}
            minDate={
              userData ? dayjs(userData?.createdAt).toDate() : dayjs().toDate()
            }
          />
          <Text
            ta="right"
            fw="bold"
            fz="xs"
            sx={{ flexGrow: 3, whiteSpace: "nowrap" }}
          >
            Total: {filterTotal > 0 ? formatCurrency(filterTotal) : "N.A."} of{" "}
            {formatCurrency(budgetRes?.response?.amount ?? 0)}
          </Text>
        </Group>
        <Divider my="sm" sx={{ width: "100%" }} />
        <Box sx={{ flexGrow: 1, width: "100%" }} ref={ref}>
          <AgGridMod
            columnDefs={columns}
            popupParent={document.body}
            onFilterChanged={updateFilterTotal}
            height={ref.current?.clientHeight ?? 0}
            rowData={listRes?.response ?? []}
            onGridReady={({ api }) => setGrid(api)}
            noRowsOverlayComponentParams={{
              message: `No expenses recorded for ${dayjs(
                payload.startDate
              ).format("MMM, 'YY")}`,
            }}
          />
        </Box>
      </Group>
      <Modal
        opened={showForm || confirm}
        withCloseButton={false}
        zIndex={1000}
        onClose={() => handleClose(false)}
      >
        {showForm && (
          <ExpenseForm data={targetExpense} onComplete={handleClose} />
        )}
        {confirm && (
          <DeleteExpense data={targetExpense} onComplete={handleClose} />
        )}
      </Modal>
      <LoadingOverlay visible={loadingBudget || loadingList} />
    </>
  );
}
