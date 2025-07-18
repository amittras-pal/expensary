import {
  ActionIcon,
  Box,
  Button,
  Divider,
  Group,
  Progress,
  ScrollArea,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { MonthPickerInput } from "@mantine/dates";
import { useHotkeys } from "@mantine/hooks";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCalendarRepeat,
  IconCash,
  IconChevronUp,
  IconExclamationMark,
  IconPlus,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BudgetItem from "../../components/BudgetItem";
import ContainedLoader from "../../components/loaders/ContainedLoader";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import EmptyState from "../../resources/empty-state.svg?react";
import { getBudget } from "../../services/budget.service";
import { getSummary } from "../../services/expense.service";
import { useDashboardStyles } from "../../theme/modules/dashboard.styles";
import { formatCurrency, getPercentage, getSeverityColor } from "../../utils";
import { _20Min } from "../../constants/app";

interface IBudgetBreakdownProps {
  showForm: () => void;
  showRecent: () => void;
  recents: number;
}

export default function BudgetBreakdown({
  showForm,
  showRecent,
  recents,
}: Readonly<IBudgetBreakdownProps>) {
  const [showSelection, setShowSelection] = useState(false);
  const [selection, setSelection] = useState<string[]>([]);
  const { userData } = useCurrentUser();
  const { onError } = useErrorHandler();
  const isMobile = useMediaMatch();
  const { classes } = useDashboardStyles();
  const [budgetPayload, setBudgetPayload] = useState({
    month: dayjs().month(),
    year: dayjs().year(),
  });
  const [payload, setPayload] = useState({
    startDate: dayjs().startOf("month").toDate(),
    endDate: dayjs().endOf("month").toDate(),
  });

  const ref = useRef<HTMLDivElement>(null);
  const selectionToggle = useRef<HTMLInputElement>(null);

  useHotkeys([
    ["n", showForm],
    [
      "shift+s",
      () => {
        setShowSelection((v) => !v);
        selectionToggle.current?.focus();
      },
    ],
  ]);

  const { data: budgetRes } = useQuery({
    queryKey: ["budget", budgetPayload],
    queryFn: () => getBudget(budgetPayload),
    onError,
    staleTime: _20Min,
  });

  const { data: summary, isLoading } = useQuery({
    queryKey: ["summary", payload],
    queryFn: () => getSummary(null, payload),
    staleTime: 300 * 1000,
    onError,
  });

  const handleSelection: React.ChangeEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    if (currentTarget.checked) setSelection((v) => [...v, currentTarget.value]);
    else setSelection((v) => v.filter((o) => o !== currentTarget.value));
  };

  const { percColor, percSpent } = useMemo(
    () => ({
      percSpent: getPercentage(
        summary?.response?.total,
        budgetRes?.response?.amount ?? 0
      ),
      percColor: getSeverityColor(
        summary?.response?.total,
        budgetRes?.response?.amount ?? 0
      ),
    }),
    [budgetRes?.response?.amount, summary?.response?.total]
  );

  const selectionTotal = useMemo(() => {
    return Object.entries(summary?.response?.summary ?? []).reduce(
      (sum, [key, data]) => (selection.includes(key) ? sum + data.total : sum),
      0
    );
  }, [selection, summary?.response]);

  const handleMonthChange = (e: Date) => {
    setPayload((prev) => ({
      ...prev,
      startDate: dayjs(e).startOf("month").toDate(),
      endDate: dayjs(e).endOf("month").toDate(),
    }));
    setBudgetPayload({
      month: dayjs(e).month(),
      year: dayjs(e).year(),
    });
  };

  if (isLoading)
    return (
      <Box className={classes.noInfo}>
        <ContainedLoader size={150} />
      </Box>
    );

  if (!budgetRes?.response?.amount)
    return (
      <Box className={classes.noInfo}>
        <EmptyState />
        <Text fs="italic" fz="sm">
          Budget not created for {dayjs().format("MMMM")}. Please create a
          budget to proceed further.
        </Text>
      </Box>
    );

  return (
    <Box ref={ref} className={classes.budgetWrapper}>
      <Group position="apart">
        <MonthPickerInput
          size="xs"
          sx={{ flex: 1, textAlign: "center" }}
          placeholder="Select month"
          variant="filled"
          value={payload.startDate}
          valueFormat="MMM 'YY"
          onChange={handleMonthChange}
          maxDate={dayjs().toDate()}
          minDate={
            userData ? dayjs(userData?.createdAt).toDate() : dayjs().toDate()
          }
          rightSection={
            payload.startDate.getMonth() === dayjs().month() ? null : (
              <Tooltip
                label={
                  <Text component="span" fw="normal" size="sm">
                    Return to current month
                  </Text>
                }
                color="dark"
                position="bottom"
              >
                <ActionIcon
                  size="sm"
                  radius="xl"
                  variant="light"
                  onClick={() => {
                    setPayload({
                      startDate: dayjs().startOf("month").toDate(),
                      endDate: dayjs().endOf("month").toDate(),
                    });
                  }}
                >
                  <IconCalendarRepeat size={16} />
                </ActionIcon>
              </Tooltip>
            )
          }
        />
        {Object.entries(summary?.response?.summary ?? {})?.length > 1 && (
          <Switch
            labelPosition="left"
            label={showSelection ? formatCurrency(selectionTotal) : "Select"}
            size="sm"
            ref={selectionToggle}
            checked={showSelection}
            onChange={(e) => {
              setShowSelection(e.currentTarget.checked);
            }}
          />
        )}
        {(summary?.response?.total ?? 0) > budgetRes?.response?.amount && (
          <Tooltip
            label={
              <Text component="span" fw="normal" size="sm">
                Budget Exceeded
              </Text>
            }
            color="dark"
            position="bottom"
          >
            <ThemeIcon radius="lg" size="sm" color="red">
              <IconExclamationMark size={14} />
            </ThemeIcon>
          </Tooltip>
        )}
      </Group>
      <Divider my="xs" />
      {Object.entries(summary?.response?.summary ?? {}).length > 0 ? (
        <ScrollArea h={`calc(100vh - ${isMobile ? 272 : 247}px)`}>
          <SimpleGrid cols={1} spacing="xs">
            {Object.entries(summary?.response?.summary ?? {})?.map((item) => (
              <BudgetItem
                key={item[0]}
                data={item}
                overallSpent={summary?.response.total ?? 0}
                showSelection={showSelection}
                selection={selection}
                onSelectionChange={handleSelection}
              />
            ))}
          </SimpleGrid>
        </ScrollArea>
      ) : (
        <Stack h="100%" justify="center">
          <EmptyState height={isMobile ? 250 : 350} />
          <Text fs="italic" align="center" fz="sm">
            No expenses added yet for this month.
          </Text>
        </Stack>
      )}
      <Group grow spacing="xs" align="flex-start" mt="auto">
        <Group
          spacing={4}
          sx={{
            height: "100%",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-start",
          }}
        >
          <Group position="apart" w="100%">
            <Text fz="sm" fw="bold" color={percColor}>
              {percSpent}%
            </Text>
            <Text size="sm" fw="normal">
              of {formatCurrency(budgetRes?.response?.amount)}
            </Text>
          </Group>
          <Progress size="xs" value={percSpent} color={percColor} w="100%" />
          <Text fz="sm">
            <IconArrowUpRight size={16} style={{ marginBottom: -3 }} />{" "}
            {formatCurrency(summary?.response?.total)}
          </Text>
          <Text fz="sm">
            <IconCash size={16} style={{ marginBottom: -3 }} />{" "}
            {formatCurrency(
              budgetRes?.response?.amount - (summary?.response?.total ?? 0)
            )}
          </Text>
        </Group>
        <Group
          sx={{
            flexDirection: "column",
            justifyContent: "flex-end",
            height: "100%",
          }}
          spacing="xs"
          align="flex-end"
        >
          <Button
            ml="auto"
            leftIcon={<IconPlus size={18} />}
            size="xs"
            onClick={showForm}
            autoFocus
          >
            Add New
          </Button>
          {isMobile && recents > 0 && (
            <Button
              size="xs"
              variant="light"
              onClick={showRecent}
              rightIcon={<IconChevronUp size={18} />}
            >
              View Recent ({recents})
            </Button>
          )}
          <Button
            size="xs"
            variant="light"
            rightIcon={<IconArrowRight size={18} />}
            component={Link}
            to="/expenses"
          >
            View All
          </Button>
        </Group>
      </Group>
    </Box>
  );
}
