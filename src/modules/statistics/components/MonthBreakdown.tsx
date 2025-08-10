import { Box, Divider, Text, useMantineTheme } from "@mantine/core";
import { IconArrowElbowRight, IconTriangleFilled } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { EChartsOption } from "echarts";
import ReactECharts from "echarts-for-react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useErrorHandler } from "../../../hooks/error-handler";
import { getSummary } from "../../../services/expense.service";
import { formatCurrency } from "../../../utils";
import { SunBurstClickParams, TreePathInfo } from "../types";

type MonthDonutProps = {
  month: number;
  year: number;
  budget: number;
};
export default function MonthBreakdown(props: Readonly<MonthDonutProps>) {
  const { onError } = useErrorHandler();
  const { colors } = useMantineTheme();
  const payload = useMemo(() => {
    const date = dayjs().month(props.month).year(props.year);
    return {
      startDate: date.startOf("month").toDate(),
      endDate: date.endOf("month").toDate(),
    };
  }, [props]);

  const { data: summary, isLoading } = useQuery({
    queryKey: ["month-breakdown", payload],
    queryFn: () => getSummary(null, payload),
    onError,
  });

  const config = useMemo(() => {
    const conditioned = summary?.response
      ? Object.entries(summary.response.summary)
      : [];

    const option: EChartsOption = {
      series: {
        type: "sunburst",
        data: conditioned.map(([category, breakdown]) => ({
          name: category,
          itemStyle: {
            color: colors[breakdown.subCategories[0].color][6],
          },
          children: breakdown.subCategories.map((subc) => ({
            name: subc.label,
            value: subc.value,
            itemStyle: {
              color: colors[subc.color][5],
            },
          })),
        })),
        radius: [60, "90%"],
        itemStyle: {
          borderRadius: 6,
          borderWidth: 2,
          borderColor: colors.gray[9],
        },
        label: {
          show: false,
          rotate: "radial",
          color: colors.gray[1],
        },
        emphasis: {
          label: {
            show: true,
          },
        },
      },
    };

    return option;
  }, [summary?.response]);

  const listDetails = useRef<ListDetailsHandle>(null);
  const handleClick = (e: SunBurstClickParams) => {
    listDetails.current?.update(e.treePathInfo);
  };

  return (
    <Box sx={{ height: "calc(100vh - 75px)" }} fz="sm">
      <ReactECharts
        option={config}
        style={{ width: "100%", height: "50%" }}
        showLoading={isLoading}
        loadingOption={{
          maskColor: colors.dark[7],
          textColor: colors.gray[2],
        }}
        onEvents={{
          click: handleClick,
          dataZoom: handleClick,
        }}
      />
      <Divider my="xs" />
      <Text color="dimmed">
        Set Budget:{" "}
        <Text component="span" color={colors.gray[1]}>
          {formatCurrency(props.budget)}
        </Text>
      </Text>

      <ListDetails
        ref={listDetails}
        defaultTotal={summary?.response.total ?? 0}
        budget={props.budget}
      />
    </Box>
  );
}

type ListDetailsHandle = {
  update: (value: TreePathInfo[]) => void;
};

const ListDetails = forwardRef<
  ListDetailsHandle,
  { defaultTotal: number; budget: number }
>(function Details(props, ref) {
  const { colors } = useMantineTheme();
  const [path, setPath] = useState<TreePathInfo[]>([
    { name: "", value: props.defaultTotal, dataIndex: 0 },
  ]);

  useEffect(() => {
    setPath([{ name: "", value: props.defaultTotal, dataIndex: 0 }]);
  }, [props.defaultTotal]);

  useImperativeHandle(ref, () => ({
    update: (treePath: TreePathInfo[]) => {
      if (treePath.length === 1 && path.length === 3) {
        setPath((v) => v.slice(0, 2));
      } else setPath(treePath);
    },
  }));

  return (
    <Box fw="sm">
      {path.map((segment, i, { length }) => (
        <Text color="dimmed" key={segment.name || "Total"} ml={i * 8}>
          {i > 0 && (
            <IconArrowElbowRight
              size={12}
              style={{ transform: "rotate(45deg)", marginRight: 8 }}
            />
          )}
          {segment.name || "Total Spent"}:{" "}
          <Text
            component="span"
            color={i === length - 1 ? colors.gray[1] : "dimmed"}
          >
            {formatCurrency(segment.value)}
          </Text>
          {i === 0 && (
            <IconTriangleFilled
              size={12}
              style={{
                margin: "0px 8px",
                transform: props.budget > path[0].value ? "rotate(180deg)" : "",
                color:
                  props.budget > path[0].value
                    ? colors.green[6]
                    : colors.red[6],
              }}
            />
          )}
        </Text>
      ))}
    </Box>
  );
});
