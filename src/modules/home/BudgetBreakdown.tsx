import {
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Progress,
  ScrollArea,
  SimpleGrid,
  Switch,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import {
  IconArrowRight,
  IconArrowUpRight,
  IconCash,
  IconChevronUp,
  IconExclamationMark,
  IconPlus,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BudgetItem from "../../components/BudgetItem";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import { getSummary } from "../../services/expense.service";
import { useDashboardStyles } from "../../theme/modules/dashboard.styles";
import { formatCurrency, getPercentage, getSeverityColor } from "../../utils";

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
  const { budget, userData } = useCurrentUser();
  const { onError } = useErrorHandler();
  const isMobile = useMediaMatch();
  const { classes } = useDashboardStyles();

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

  const {
    data: summary,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["summary", null],
    queryFn: () => getSummary(null),
    refetchOnWindowFocus: false,
    staleTime: 120 * 1000,
    onError,
  });

  useEffect(() => {
    if (userData) refetch();
  }, [refetch, userData]);

  const handleSelection: React.ChangeEventHandler<HTMLInputElement> = ({
    currentTarget,
  }) => {
    if (currentTarget.checked) setSelection((v) => [...v, currentTarget.value]);
    else setSelection((v) => v.filter((o) => o !== currentTarget.value));
  };

  const { percColor, percSpent } = useMemo(
    () => ({
      percSpent: getPercentage(summary?.response?.total, budget ?? 0),
      percColor: getSeverityColor(summary?.response?.total, budget ?? 0),
    }),
    [budget, summary?.response?.total]
  );

  const selectionTotal = useMemo(() => {
    return Object.entries(summary?.response?.summary ?? []).reduce(
      (sum, [key, data]) => (selection.includes(key) ? sum + data.total : sum),
      0
    );
  }, [selection, summary?.response]);

  if (isLoading)
    return (
      <Box className={classes.noInfo}>
        <Loader size={50} />
      </Box>
    );

  if (!budget)
    return (
      <Box className={classes.noInfo}>
        <Text>Budget Info not Available.</Text>
      </Box>
    );

  return (
    <Box ref={ref} className={classes.budgetWrapper}>
      <Group position="apart">
        <Text fw="bold" mr="auto">
          {dayjs().format("MMM, 'YY")}
        </Text>
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
        {(summary?.response?.total ?? 0) > budget && (
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
      <ScrollArea h={`calc(100vh - ${isMobile ? 272 : 242}px)`}>
        <SimpleGrid cols={1} spacing="xs">
          {Object.entries(summary?.response?.summary ?? {})?.map((item) => (
            <BudgetItem
              key={item[0]}
              data={item}
              showSelection={showSelection}
              selection={selection}
              onSelectionChange={handleSelection}
            />
          ))}
        </SimpleGrid>
      </ScrollArea>
      <Group grow spacing="xs" align="flex-start" mt="auto">
        <Group
          sx={{
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-start",
          }}
          h="100%"
          spacing={4}
        >
          <Group position="apart" w="100%">
            <Text fz="sm" fw="bold" color={percColor}>
              {percSpent}%
            </Text>
            <Text size="sm" fw="normal">
              of {formatCurrency(budget)}
            </Text>
          </Group>
          <Progress size="xs" value={percSpent} color={percColor} w="100%" />
          <Text fz="sm">
            <IconArrowUpRight size={16} style={{ marginBottom: -3 }} />{" "}
            {formatCurrency(summary?.response?.total)}
          </Text>
          <Text fz="sm">
            <IconCash size={16} style={{ marginBottom: -3 }} />{" "}
            {formatCurrency(budget - (summary?.response?.total ?? 0))}
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
