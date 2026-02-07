import { ActionIcon, Divider, Popover, Text } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useMediaMatch } from "../../../hooks/media-match";
import { abbreviateNumber, formatCurrency } from "../../../utils";

type YearSummaryProps = {
  year: string;
  spends: number[];
  budgets: number[];
};

export default function YearSummary({
  year,
  spends,
  budgets,
}: Readonly<YearSummaryProps>) {
  const isMobile = useMediaMatch();

  const totalSpent = spends.reduce((total, curr) => total + curr, 0);
  const exceeded = spends.reduce(
    (exc, curr, i) => exc + (curr > budgets[i] ? 1 : 0),
    0
  );
  const avgBudget =
    budgets.reduce((a, b) => a + b, 0) / budgets.filter((v) => v > 0).length;
  const maxMonth = spends.findIndex((v) => v === Math.max(...spends));

  return (
    <Popover position="bottom-end" withinPortal zIndex={10000000}>
      <Popover.Target>
        <ActionIcon ml="auto" size="md" variant="default">
          <IconSparkles size={18} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown fz="sm" style={{ maxWidth: isMobile ? 240 : 400 }}>
        <Text fw="bold">Your {year} spends at a glance.</Text>
        <Divider my="xs" />
        <Text>
          You spent about{" "}
          <Text fw="bold" component="span">
            ₹{abbreviateNumber(totalSpent)}
          </Text>{" "}
          this year. Your average budget was{" "}
          <Text fw="bold" component="span">
            {formatCurrency(avgBudget)}
          </Text>
          . You exceeded your set budget{" "}
          <Text fw="bold" component="span">
            {exceeded}
          </Text>{" "}
          times. Your spent the most in{" "}
          <Text fw="bold" component="span">
            {dayjs().month(maxMonth).format("MMMM")}
          </Text>
          , with a total of{" "}
          <Text fw="bold" component="span">
            {formatCurrency(spends[maxMonth])}
          </Text>
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
}
