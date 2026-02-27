import { ChangeEventHandler, MouseEventHandler } from "react";
import {
  ActionIcon,
  Box,
  Group,
  Stack,
  Switch,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconCalendarRepeat, IconTrash } from "@tabler/icons-react";
import { Icons } from "../../constants/categories";
import { formatCurrency } from "../../utils";

type ExpenseRuleProps = {
  rule: IRecurringExpense;
  onToggle: ChangeEventHandler<HTMLInputElement>;
  onEdit: () => void;
  onDelete: MouseEventHandler<HTMLButtonElement>;
};

const daySuffix = ["th", "st", "nd", "rd"];

export default function ExpenseRule({
  rule,
  onToggle,
  onEdit,
  onDelete,
}: Readonly<ExpenseRuleProps>) {
  const Icon =
    Icons[(rule.category?.icon as keyof typeof Icons) ?? ""] ??
    IconCalendarRepeat;

  return (
    <Group
      key={rule._id}
      gap="sm"
      wrap="nowrap"
      style={(theme) => ({
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        backgroundColor: "var(--mantine-color-dark-7)",
      })}
    >
      <Switch size="xs" checked={rule.active} onChange={onToggle} />
      <ThemeIcon
        variant="light"
        color={rule.active ? (rule.category?.color ?? "gray") : "gray"}
        size="lg"
      >
        <Icon size={18} />
      </ThemeIcon>
      <Box style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={onEdit}>
        <Text fz="sm" fw={500} truncate c={rule.active ? undefined : "dimmed"}>
          {rule.title}
        </Text>
        <Text fz="xs" c="dimmed" truncate>
          {rule.category?.label ?? "Unknown category"}
        </Text>
      </Box>
      <Stack gap={2} align="flex-end">
        <Text fz="sm" fw={600}>
          {formatCurrency(rule.amount)}
        </Text>
        <Text fz="xs" c="dimmed">
          {rule.dayOfMonth}
          {daySuffix[rule.dayOfMonth] ?? daySuffix[0]} /m
        </Text>
      </Stack>
      <ActionIcon variant="subtle" color="red" size="sm" onClick={onDelete}>
        <IconTrash size={14} />
      </ActionIcon>
    </Group>
  );
}
