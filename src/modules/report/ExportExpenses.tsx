import { useMemo, useState } from "react";
import {
  Button,
  Checkbox,
  Group,
  SegmentedControl,
  Select,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  DatePicker,
  DatesRangeValue,
  MonthPicker,
  PickerBaseProps,
} from "@mantine/dates";
import { useDocumentTitle } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDownload, IconTableDown } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs, { OpUnitType } from "dayjs";
import { APP_TITLE, _20Min } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import { exportPlan, exportRange } from "../../services/export.service";
import { getPlansLite } from "../../services/plans.service";
import classes from "../../theme/modules/report.module.scss";
import { downloadFile } from "../../utils";

interface CommonPickerProps extends PickerBaseProps<"range"> {
  className: string;
  minDate: Date;
  maxDate: Date;
}

export default function DownloadReport() {
  useDocumentTitle(`${APP_TITLE} | Export Expenses`);
  const { primaryColor } = useMantineTheme();
  const [view, setView] = useState<string>("day");
  const [includeList, setIncludeList] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [selection, setSelection] = useState<DatesRangeValue>([null, null]);

  const { userData } = useCurrentUser();
  const { onError } = useErrorHandler();
  const isMobile = useMediaMatch();

  // Handle different picker onChange types for Mantine v8
  const handleDatePickerChange = (value: any) => {
    if (Array.isArray(value)) {
      if (typeof value[0] === "string") {
        // Handle string array - convert to Date array
        setSelection([
          value[0] ? new Date(value[0]) : null,
          value[1] ? new Date(value[1]) : null,
        ]);
      } else {
        // Handle Date array
        setSelection([value[0] || null, value[1] || null]);
      }
    } else if (typeof value === "string") {
      // Handle single string value
      setSelection([new Date(value), null]);
    } else if (value instanceof Date) {
      // Handle single Date value
      setSelection([value, null]);
    } else {
      // Handle null
      setSelection([null, null]);
    }
  };

  const pickerProps = useMemo(
    (): CommonPickerProps => ({
      className: classes.wrapper,
      type: "range",
      maxDate: dayjs().toDate(),
      minDate: userData
        ? dayjs(userData?.createdAt).toDate()
        : dayjs().toDate(),
    }),
    [userData]
  );

  const { mutate: downloadRange, isLoading: downloadingRange } = useMutation({
    mutationFn: exportRange,
    onSuccess: (res) => {
      downloadFile(
        res,
        `Report_${userData?.userName.replace(" ", "_")}_${dayjs()
          .toDate()
          .toISOString()}.xlsx`
      );
      notifications.show({
        message: "",
        title: "Expenses for the selected range exported successfully!",
        color: "green",
        icon: <IconDownload size={16} />,
      });
    },
    onError,
  });

  const { mutate: downloadPlan, isLoading: downloadingPlan } = useMutation({
    mutationFn: exportPlan,
    onSuccess: (res) => {
      downloadFile(res, `Plan Export - ${plan}.xlsx`);
      notifications.show({
        message: "",
        title: "Plan Details Exported Successfully!",
        color: "green",
        icon: <IconDownload size={16} />,
      });
    },
    onError,
  });

  const { data: closedPlansRes, isLoading: loadingOpenPlans } = useQuery({
    queryKey: ["plans-list-lite", false],
    queryFn: () => getPlansLite("false"),
    refetchOnMount: false,
    staleTime: _20Min,
    enabled: view === "plan",
    onError,
  });

  const { data: openPlansRes, isLoading: loadingClosedPlans } = useQuery({
    queryKey: ["plans-list-lite", true],
    queryFn: () => getPlansLite("true"),
    refetchOnMount: false,
    staleTime: _20Min,
    enabled: view === "plan",
    onError,
  });

  const handleDownload = () => {
    if (view !== "plan") {
      downloadRange({
        startDate: dayjs(selection[0])
          .startOf(view as OpUnitType)
          .toDate(),
        endDate: dayjs(selection[1])
          .endOf(view as OpUnitType)
          .toDate(),
        includeList,
      });
    } else {
      downloadPlan({ plan: plan ?? "" });
    }
  };

  return (
    <Group
      justify="center"
      style={(theme) => ({
        maxWidth: isMobile ? "95%" : 400,
        flexDirection: "column",
        margin: "auto",
        backgroundColor: theme.colors.dark[6],
        padding: theme.spacing.xs,
        borderRadius: theme.radius.md,
      })}
    >
      <Text mr="auto">Select export type.</Text>
      <SegmentedControl
        size="sm"
        value={view}
        color={primaryColor}
        onChange={(mode) => setView(mode)}
        style={{ width: "100%" }}
        data={[
          { label: "Dates Range", value: "day" },
          { label: "Months Range", value: "month" },
          { label: "Plan", value: "plan" },
        ]}
      />
      {view === "day" && (
        <DatePicker
          {...pickerProps}
          value={selection}
          onChange={handleDatePickerChange}
        />
      )}
      {view === "month" && (
        <MonthPicker
          {...pickerProps}
          value={selection}
          onChange={handleDatePickerChange}
        />
      )}
      {view === "plan" && (
        <Select
          style={{ width: "100%" }}
          placeholder="Select Plan"
          mb={0}
          value={plan}
          onChange={setPlan}
          disabled={loadingOpenPlans || loadingClosedPlans}
          nothingFoundMessage="No Plans to Export"
          data={[
            {
              group: "Open Plans",
              items:
                openPlansRes?.response.map((plan) => ({
                  label: plan.name,
                  value: plan._id,
                })) ?? [],
            },
            {
              group: "Closed Plans",
              items:
                closedPlansRes?.response.map((plan) => ({
                  label: plan.name,
                  value: plan._id,
                })) ?? [],
            },
          ]}
        />
      )}
      {view !== "plan" && (
        <Checkbox
          checked={includeList}
          onChange={(e) => setIncludeList(e.currentTarget.checked)}
          label="Include Expenses List"
        />
      )}
      <Button
        fullWidth
        disabled={view === "plan" ? !plan : !selection[0] || !selection[1]}
        leftSection={<IconTableDown size={16} />}
        onClick={handleDownload}
        loading={downloadingRange || downloadingPlan}
      >
        Export to Excel
      </Button>
    </Group>
  );
}
