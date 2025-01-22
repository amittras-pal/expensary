import {
  Button,
  Checkbox,
  Group,
  SegmentedControl,
  Select,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { DatePicker, MonthPicker, PickerBaseProps } from "@mantine/dates";
import { useDocumentTitle } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDownload, IconTableDown } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { APP_TITLE } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import { exportPlan, exportRange } from "../../services/export.service";
import { getPlans } from "../../services/plans.service";
import { useReportStyles } from "../../theme/modules/report.styles";
import { downloadFile } from "../../utils";

interface CommonPickerProps extends PickerBaseProps<"range"> {
  className: string;
  minDate: Date;
  maxDate: Date;
}

export default function DownloadReport() {
  useDocumentTitle(`${APP_TITLE} | Export Expenses`);
  const { primaryColor } = useMantineTheme();
  const [view, setView] = useState<"day" | "month" | "plan">("day");
  const [includeList, setIncludeList] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);
  const [selection, setSelection] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);

  const { classes } = useReportStyles();
  const { userData } = useCurrentUser();
  const { onError } = useErrorHandler();
  const isMobile = useMediaMatch();

  const pickerProps = useMemo(
    (): CommonPickerProps => ({
      className: classes.wrapper,
      type: "range",
      maxDate: dayjs().toDate(),
      minDate: userData
        ? dayjs(userData?.createdAt).toDate()
        : dayjs().toDate(),
    }),
    [classes.wrapper, userData]
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

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["plans-list", false],
    queryFn: () => getPlans("false"),
    refetchOnMount: false,
    staleTime: 10 * 60 * 60,
    enabled: view === "plan",
    onError,
  });

  const handleDownload = () => {
    if (view !== "plan") {
      downloadRange({
        startDate: dayjs(selection[0]).startOf(view).toDate(),
        endDate: dayjs(selection[1]).endOf(view).toDate(),
        includeList,
      });
    } else {
      downloadPlan({ plan: plan ?? "" });
    }
  };

  return (
    <Group
      position="center"
      sx={{
        maxWidth: isMobile ? "95%" : 400,
        flexDirection: "column",
        margin: "auto",
      }}
    >
      <Text mr="auto">Select export type.</Text>
      <SegmentedControl
        size="sm"
        value={view}
        color={primaryColor}
        onChange={(mode: "day" | "month" | "plan") => setView(mode)}
        sx={{ width: "100%" }}
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
          onChange={setSelection}
        />
      )}
      {view === "month" && (
        <MonthPicker
          {...pickerProps}
          value={selection}
          onChange={setSelection}
        />
      )}
      {view === "plan" && (
        <Select
          style={{ width: "100%" }}
          placeholder="Select Plan"
          mb={0}
          value={plan}
          onChange={setPlan}
          disabled={loadingPlans}
          nothingFound="No Plans to Export"
          data={
            plans?.response.map((plan) => ({
              label: `${plan.name} (${plan.open ? "Active" : "Closed"})`,
              value: plan._id,
            })) ?? []
          }
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
        leftIcon={<IconTableDown size={16} />}
        onClick={handleDownload}
        loading={downloadingRange || downloadingPlan}
      >
        Export to Excel
      </Button>
    </Group>
  );
}
