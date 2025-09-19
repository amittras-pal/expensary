import {
  ActionIcon,
  Box,
  Group,
  Notification,
  Portal,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCopy, IconX } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ColDef, GridApi } from "ag-grid-community";
import { useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AgGridMod from "../../../components/ag-grid/AgGridMod";
import { RowMenuCell } from "../../../components/ag-grid/plugins/cells";
import generateColDef from "../../../components/ag-grid/utils/columns";
import OverlayLoader from "../../../components/loaders/OverlayLoader";
import { useErrorHandler } from "../../../hooks/error-handler";
import { useMediaMatch } from "../../../hooks/media-match";
import { getExpenseList } from "../../../services/expense.service";
import { copyExpensesToBudget } from "../../../services/plans.service";
import classes from "../../../theme/modules/planExpenses.module.css";

interface IPlanExpensesListProps {
  plan: IExpensePlan;
  onExpenseAction: (data: IExpense, mode: "edit" | "delete") => void;
}

export default function PlanExpensesList({
  onExpenseAction,
  plan,
}: Readonly<IPlanExpensesListProps>) {
  const { onError } = useErrorHandler();

  const [selection, setSelection] = useState<string[]>([]);
  const [grid, setGrid] = useState<GridApi<IExpense> | null>(null);

  const params = useParams();
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useMediaMatch();

  const payload = useMemo(
    () => ({
      sort: { date: -1 },
      plan: params.id,
    }),
    [params]
  );

  const clearSelection = () => {
    setSelection([]);
    grid?.deselectAll();
  };

  const {
    data: listRes,
    isLoading: loadingList,
    refetch,
  } = useQuery({
    queryKey: ["list", payload],
    queryFn: () => getExpenseList(payload),
    onSuccess: () => {
      grid?.destroyFilter("category.group");
      grid?.destroyFilter("category._id");
    },
    onError,
  });

  const { mutate: copy, isLoading: copying } = useMutation({
    mutationFn: copyExpensesToBudget,
    onError,
    onSuccess: (res) => {
      notifications.show({
        message: res.data?.message,
        color: "green",
        icon: <IconCheck />,
      });
      clearSelection();
      refetch();
    },
  });

  const columns = useMemo((): ColDef[] => {
    return generateColDef([
      ["rowSelection", { hide: plan.open }],
      [
        "rowMenu",
        {
          hide: !plan.open,
          cellRenderer: RowMenuCell,
          cellRendererParams: {
            onEditExpense: (data: IExpense) => onExpenseAction(data, "edit"),
            onDeleteExpense: (data: IExpense) =>
              onExpenseAction(data, "delete"),
            plan: plan,
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
  }, [isMobile, onExpenseAction, plan]);

  return (
    <>
      <OverlayLoader visible={loadingList} />
      <Box ref={ref} style={{ height: "100%" }}>
        <AgGridMod
          columnDefs={columns}
          popupParent={document.body}
          height={ref.current?.clientHeight ?? 0}
          rowData={listRes?.response ?? []}
          onGridReady={({ api }) => setGrid(api)}
          rowSelection="multiple"
          isRowSelectable={(e) => !e.data?.linked}
          onRowSelected={({ api }) => {
            const selectedExpenses = api
              .getSelectedNodes()
              ?.map((row) => row.data._id);
            setSelection(selectedExpenses);
          }}
          suppressRowClickSelection
          noRowsOverlayComponentParams={{
            message: `No expenses recorded for this expense plan`,
          }}
        />
      </Box>
      {selection.length > 0 && (
  <Portal target={document.body} className={classes.wrapper}>
          <Notification
            style={{ maxWidth: "95%" }}
            withCloseButton={false}
            title={`Copy ${selection.length} expenses to monthly budget.`}
            onClose={clearSelection}
          >
            <Group justify="space-between" gap={8} noWrap>
              <Text>
                <Text size="xs" color="dimmed" mt={6} component="span">
                  Expenses will be copied to monthly budget at creation date.{" "}
                </Text>
                {!isMobile && <br />}
                <Text size="xs" color="red" component="span">
                  Copied expenses cannot be modified!
                </Text>
              </Text>
              <Box>
                <ActionIcon
                  color="green"
                  variant="filled"
                  radius="sm"
                  mb={6}
                  loading={copying}
                  onClick={() => copy({ expenses: selection })}
                >
                  <IconCopy size={14} />
                </ActionIcon>
                <ActionIcon
                  color="red"
                  variant="filled"
                  radius="sm"
                  onClick={() => {
                    setSelection([]);
                    grid?.deselectAll();
                  }}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Box>
            </Group>
          </Notification>
        </Portal>
      )}
    </>
  );
}
