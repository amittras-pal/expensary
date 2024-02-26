import {
  Button,
  Checkbox,
  Group,
  SegmentedControl,
  useMantineTheme,
} from "@mantine/core";
import { DatePicker, MonthPicker, PickerBaseProps } from "@mantine/dates";
import { useDocumentTitle } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconDownload } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import dayjs, { OpUnitType } from "dayjs";
import { useMemo, useState } from "react";
import { APP_TITLE } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { downloadReport } from "../../services/report.service";
import { useReportStyles } from "../../theme/modules/report.styles";
import { downloadFile } from "../../utils";

interface CommonPickerProps extends PickerBaseProps<"range"> {
  className: string;
  minDate: Date;
  maxDate: Date;
}

export default function DownloadReport() {
  useDocumentTitle(`${APP_TITLE} | Download Report`);
  const { primaryColor } = useMantineTheme();
  const [selection, setSelection] = useState<[Date | null, Date | null]>([
    null,
    null,
  ]);
  const [includeList, setIncludeList] = useState(false);
  const [view, setView] = useState<OpUnitType>("month");

  const { classes } = useReportStyles();
  const { userData } = useCurrentUser();
  const { onError } = useErrorHandler();

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

  const { mutate: download, isLoading } = useMutation({
    mutationFn: downloadReport,
    onSuccess: (res) => {
      downloadFile(
        res,
        `Report_${userData?.userName.replace(" ", "_")}_${dayjs()
          .toDate()
          .toISOString()}.pdf`
      );
      notifications.show({
        message: "",
        title: "Report Downloaded Successfully!",
        color: "green",
        icon: <IconDownload size={16} />,
      });
    },
    onError,
  });

  const handleDownload = () => {
    download({
      startDate: dayjs(selection[0]).startOf(view).toDate(),
      endDate: dayjs(selection[1]).endOf(view).toDate(),
      includeList,
    });
  };

  return (
    <Group position="center">
      <Group position="center" sx={{ maxWidth: 290, flexDirection: "column" }}>
        <SegmentedControl
          size="sm"
          value={view}
          color={primaryColor}
          onChange={(mode: OpUnitType) => setView(mode)}
          sx={{ width: "100%" }}
          data={[
            { label: "Dates Range", value: "day" },
            { label: "Months Range", value: "month" },
          ]}
        />
        {view === "day" ? (
          <DatePicker
            {...pickerProps}
            value={selection}
            onChange={setSelection}
          />
        ) : (
          <MonthPicker
            {...pickerProps}
            value={selection}
            onChange={setSelection}
          />
        )}
        <Checkbox
          checked={includeList}
          onChange={(e) => setIncludeList(e.currentTarget.checked)}
          label="Include Expenses List"
        />
        <Button
          fullWidth
          disabled={!selection[0] || !selection[1]}
          leftIcon={<IconDownload size={16} />}
          onClick={handleDownload}
          loading={isLoading}
        >
          Download
        </Button>
      </Group>
    </Group>
  );
}
