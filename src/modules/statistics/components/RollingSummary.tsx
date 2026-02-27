import { ActionIcon, Divider, Popover, Text } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useMediaMatch } from "../../../hooks/media-match";
import { abbreviateNumber, formatCurrency } from "../../../utils";

type RollingSummaryProps = {
  months: number;
  spends: number[];
  budgets: number[];
  slots: { month: number; year: number }[];
};

export default function RollingSummary({
  months,
  spends,
  budgets,
  slots,
}: Readonly<RollingSummaryProps>) {
  const isMobile = useMediaMatch();

  const totalSpent = spends.reduce((total, curr) => total + curr, 0);
  const exceeded = spends.reduce(
    (exc, curr, i) => exc + (curr > budgets[i] ? 1 : 0),
    0
  );
  const activeBudgets = budgets.filter((v) => v > 0);
  const avgBudget =
    activeBudgets.length > 0
      ? activeBudgets.reduce((a, b) => a + b, 0) / activeBudgets.length
      : 0;
  const max = Math.max(...spends);
  const maxIndex = spends.indexOf(max);
  const maxSlot = slots[maxIndex];

  return (
    <Popover position="bottom-end" withinPortal zIndex={10000000}>
      <Popover.Target>
        <ActionIcon ml="auto" size="md" variant="default">
          <IconSparkles size={18} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown fz="sm" style={{ maxWidth: isMobile ? 240 : 400 }}>
        <Text fw="bold">Past {months} months at a glance.</Text>
        <Divider my="xs" />
        <Text>
          You spent about{" "}
          <Text fw="bold" component="span">
            ₹{abbreviateNumber(totalSpent)}
          </Text>{" "}
          over the last {months} months. Your average budget was{" "}
          <Text fw="bold" component="span">
            {formatCurrency(avgBudget)}
          </Text>
          . You exceeded your set budget{" "}
          <Text fw="bold" component="span">
            {exceeded}
          </Text>{" "}
          times.
          {maxSlot && (
            <>
              {" "}
              You spent the most in{" "}
              <Text fw="bold" component="span">
                {dayjs()
                  .month(maxSlot.month - 1)
                  .year(maxSlot.year)
                  .format("MMMM YYYY")}
              </Text>
              , with a total of{" "}
              <Text fw="bold" component="span">
                {formatCurrency(spends[maxIndex])}
              </Text>
            </>
          )}
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
}
