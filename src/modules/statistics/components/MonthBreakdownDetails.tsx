import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { Box, Button, Divider, Text, useMantineTheme } from "@mantine/core";
import { IconArrowElbowRight, IconTriangleFilled } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ColDef } from "ag-grid-community";
import AgGridMod from "../../../components/ag-grid/AgGridMod";
import generateColDef from "../../../components/ag-grid/utils/columns";
import { _20Min } from "../../../constants/app";
import { useErrorHandler } from "../../../hooks/error-handler";
import { useMediaMatch } from "../../../hooks/media-match";
import { getCategories } from "../../../services/categories.service";
import { searchExpenses } from "../../../services/expense.service";
import { formatCurrency } from "../../../utils";
import { TreePathInfo } from "../types";

export type ListDetailsHandle = {
  update: (value: TreePathInfo[]) => void;
};

type ListDetailsProps = {
  defaultTotal: number;
  budget: number;
  year: number;
  month: number;
};

export default forwardRef<ListDetailsHandle, ListDetailsProps>(
  function MonthBreakdownDetails(props, ref) {
    const { colors } = useMantineTheme();
    const isMobile = useMediaMatch();
    const { onError } = useErrorHandler();

    const [path, setPath] = useState<TreePathInfo[]>([
      { name: "", value: props.defaultTotal, dataIndex: 0 },
    ]);
    const [showExpenses, setShowExpenses] = useState(false);

    useEffect(() => {
      setPath([{ name: "", value: props.defaultTotal, dataIndex: 0 }]);
    }, [props.defaultTotal]);

    useImperativeHandle(ref, () => ({
      update: (treePath: TreePathInfo[]) => {
        if (treePath.length === 1 && path.length === 3) {
          setPath((v) => v.slice(0, 2));
        } else setPath(treePath);

        setShowExpenses(false);
        clearResults();
      },
    }));

    const { data: categoryRes, isLoading: loadingCategories } = useQuery({
      queryKey: ["categories"],
      queryFn: getCategories,
      onError,
      staleTime: _20Min,
      enabled: path.length === 3,
    });

    const {
      data: expenses,
      mutate: search,
      isLoading: searching,
      reset: clearResults,
    } = useMutation({
      mutationFn: searchExpenses,
      onError,
    });

    const handleLoadExpenses = () => {
      if (showExpenses) {
        setShowExpenses(false);
        return;
      }

      setShowExpenses(true);
      const category = categoryRes?.response.find(
        (el) => el.label === path.at(-1)?.name
      );

      const payload: ISearchReqBody = {
        startDate: dayjs()
          .year(props.year)
          .month(props.month - 1)
          .startOf("month")
          .toDate(),
        endDate: dayjs()
          .year(props.year)
          .month(props.month - 1)
          .endOf("month")
          .toDate(),
        categories: [category?._id ?? ""],
      };
      search(payload);
    };

    const columns = useMemo((): ColDef[] => {
      return generateColDef([
        [
          "rowMenu",
          {
            headerComponent: undefined,
            valueFormatter: ({ node }) =>
              ((node?.rowIndex ?? 0) + 1).toString(),
          },
        ],
        ["description"],
        ["title", { minWidth: isMobile ? 240 : 320 }],
        ["amount"],
        ["date"],
      ]);
    }, [isMobile]);

    return (
      <Box fw="sm" pb="sm">
        {path.map((segment, i, { length }) => (
          <Text c="dimmed" key={segment.name || "Total"} ml={i * 8}>
            {i > 0 && (
              <IconArrowElbowRight
                size={12}
                style={{ transform: "rotate(45deg)", marginRight: 8 }}
              />
            )}
            {segment.name || "Total Spent"}:{" "}
            <Text
              component="span"
              c={i === length - 1 ? colors.gray[1] : "dimmed"}
            >
              {formatCurrency(segment.value)}
            </Text>
            {i === 0 && (
              <IconTriangleFilled
                size={12}
                style={{
                  margin: "0px 8px",
                  transform:
                    props.budget > path[0].value ? "rotate(180deg)" : "",
                  color:
                    props.budget > path[0].value
                      ? colors.green[6]
                      : colors.red[6],
                }}
              />
            )}
            {i === 2 && (
              <Button
                size="xs"
                variant="transparent"
                onClick={handleLoadExpenses}
                loading={searching}
                color="gray"
                disabled={loadingCategories}
              >
                {showExpenses ? "Hide" : "Show"} Expenses
              </Button>
            )}
          </Text>
        ))}
        {showExpenses && expenses && (
          <>
            <Divider my="sm" />
            <AgGridMod
              className="stats-table"
              columnDefs={columns}
              height={435}
              rowHeight={40}
              rowData={expenses?.response ?? []}
            />
          </>
        )}
      </Box>
    );
  }
);
