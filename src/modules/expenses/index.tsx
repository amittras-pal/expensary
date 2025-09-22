import { useCallback, useMemo, useRef, useState } from "react";
import { Box, Divider, Group, Modal, Text } from "@mantine/core";
import { DateValue, MonthPickerInput } from "@mantine/dates";
import { useDisclosure, useDocumentTitle, useHotkeys } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ColDef, FilterChangedEvent, GridApi } from "ag-grid-community";
import DeleteExpense from "../../components/DeleteExpense";
import ExpenseForm from "../../components/ExpenseForm";
import AgGridMod from "../../components/ag-grid/AgGridMod";
import { RowMenuCell } from "../../components/ag-grid/plugins/cells";
import generateColDef from "../../components/ag-grid/utils/columns";
import OverlayLoader from "../../components/loaders/OverlayLoader";
import { APP_TITLE, _20Min } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import { getBudget } from "../../services/budget.service";
import { getExpenseList } from "../../services/expense.service";
import { formatCurrency } from "../../utils";

interface ExpenseAtRow extends IExpense {
  index: number;
}

export default function Expenses() {
  useDocumentTitle(`${APP_TITLE} | All Transactions`);
  const { userData } = useCurrentUser();
  const { onError } = useErrorHandler();

  const isMobile = useMediaMatch();

  const client = useQueryClient();

  const [showForm, formModal] = useDisclosure(false);
  const [confirm, deleteModal] = useDisclosure(false);

  const [targetExpense, setTargetExpense] = useState<ExpenseAtRow | null>(null);
  const [filterTotal, setFilterTotal] = useState(0);
  const [grid, setGrid] = useState<GridApi<IExpense> | null>(null);
  const [budgetPayload, setBudgetPayload] = useState({
    month: dayjs().month(),
    year: dayjs().year(),
  });
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
    onSuccess: (res) => {
      clearFilters();
      const total =
        res?.response?.reduce((sum, item) => sum + item.amount, 0) ?? 0;
      setFilterTotal(total);
    },
    onError,
  });

  const { data: budgetRes, isLoading: loadingBudget } = useQuery({
    queryKey: ["budget", budgetPayload],
    queryFn: () => getBudget(budgetPayload),
    onError,
    staleTime: _20Min,
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
    return generateColDef([
      [
        "rowMenu",
        {
          cellRenderer: RowMenuCell,
          cellRendererParams: {
            onEditExpense: editExpense,
            onDeleteExpense: deleteExpense,
          },
        },
      ],
      ["description"],
      ["title", { minWidth: isMobile ? 240 : 320 }],
      ["category"],
      ["subCategory"],
      ["amount"],
      ["date"],
    ]);
  }, [isMobile, deleteExpense, editExpense]);

  const updateFilterTotal = (grid: FilterChangedEvent<IExpense>) => {
    let total = 0;
    grid.api.forEachNodeAfterFilter((node) => {
      total += node.data?.amount ?? 0;
    });
    setFilterTotal(total);
  };

  const handleMonthChange = (e: DateValue) => {
    setPayload((prev) => ({
      ...prev,
      startDate: dayjs(e).startOf("month").toDate(),
      endDate: dayjs(e).endOf("month").toDate(),
      sort: { date: -1 },
    }));
    setBudgetPayload({
      month: dayjs(e).month(),
      year: dayjs(e).year(),
    });
  };

  return (
    <>
      <Group gap="xs" style={{ width: "100%" }}>
        <MonthPickerInput
          size="xs"
          style={{ flexGrow: 1, textAlign: "center" }}
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
          style={{ flexGrow: isMobile ? 3 : 4, whiteSpace: "nowrap" }}
        >
          Total: {filterTotal > 0 ? formatCurrency(filterTotal) : "N.A."} of{" "}
          {formatCurrency(budgetRes?.response?.amount ?? 0)}
        </Text>
      </Group>
      <Divider my="sm" style={{ width: "100%" }} />
      <Box style={{ width: "100%", height: "calc(100vh - 150px)" }} ref={ref}>
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
      <OverlayLoader visible={loadingBudget || loadingList} />
    </>
  );
}
