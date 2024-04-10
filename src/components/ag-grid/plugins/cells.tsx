import {
  ActionIcon,
  Badge,
  Group,
  Menu,
  Popover,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import {
  IconBookmark,
  IconCalendarCode,
  IconDotsVertical,
  IconEdit,
  IconInfoCircle,
  IconTrash,
} from "@tabler/icons-react";
import { ICellRendererParams } from "ag-grid-community";
import dayjs from "dayjs";
import { useMemo } from "react";
import { useCurrentUser } from "../../../context/user.context";
import { formatCurrency } from "../../../utils";
import ExpenseDescription from "../../ExpenseDescription";
import { MenuCellProps, MetaCellProps } from "../interfaces";

export function MetaCell({ data, page }: Readonly<MetaCellProps>) {
  const { primaryColor } = useMantineTheme();
  if (!data?.description && !data?.linked && (data?.amount ?? 0) > 0)
    return null;

  return (
    <Popover withinPortal withArrow shadow="md" width={280} position="bottom">
      <Popover.Target>
        <ActionIcon size="sm" radius="xl" color={primaryColor} variant="light">
          <IconInfoCircle size={18} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p={8}>
        {data?.description && (
          <Group spacing={6} sx={{ alignItems: "flex-start" }}>
            <ThemeIcon
              radius="sm"
              size="sm"
              color={primaryColor}
              variant="filled"
            >
              <IconInfoCircle size={14} stroke={1.5} />
            </ThemeIcon>
            <ExpenseDescription color="dimmed">
              {data?.description}
            </ExpenseDescription>
          </Group>
        )}
        {data?.linked && (
          <Group spacing={6} sx={{ alignItems: "flex-start" }} mt={6}>
            <ThemeIcon
              radius="sm"
              size="sm"
              color={primaryColor}
              variant="filled"
            >
              <IconCalendarCode size={14} stroke={1.5} />
            </ThemeIcon>
            <Text component="span" fz="xs" color="dimmed">
              {page === "budget" ? "Created in a plan." : "Copied to Budget."}
            </Text>
          </Group>
        )}
        {!data?.amount && (
          <Group spacing={6} sx={{ alignItems: "flex-start" }} mt={6}>
            <ThemeIcon
              radius="sm"
              size="sm"
              color={primaryColor}
              variant="filled"
            >
              <IconBookmark size={14} stroke={1.5} />
            </ThemeIcon>
            <Text component="span" size="xs" color="dimmed">
              Created to keep record; no money spent.
            </Text>
          </Group>
        )}
      </Popover.Dropdown>
    </Popover>
  );
}

export function CategoryCell({
  data,
  value,
}: ICellRendererParams<IExpense, string>) {
  return (
    <Badge
      size="sm"
      component="div"
      variant="light"
      color={data?.category?.color}
    >
      {value}
    </Badge>
  );
}

export function RowMenuCell({
  data,
  onEditExpense,
  onDeleteExpense,
  rowIndex,
  plan,
}: Readonly<MenuCellProps>) {
  const { userData } = useCurrentUser();
  const availableActions = useMemo(() => {
    const actions = [];
    if (plan) {
      if (
        plan.open &&
        dayjs(data?.date) >= dayjs().subtract(userData?.editWindow ?? 7, "days")
      )
        actions.push("edit", "delete");
    } else if (
      dayjs(data?.date) >= dayjs().subtract(userData?.editWindow ?? 7, "days")
    )
      actions.push("edit", "delete");

    return actions;
  }, [data?.date, plan, userData?.editWindow]);

  if (!availableActions.length) return null;

  return (
    <Menu shadow="md" position="right-start" withinPortal>
      <Menu.Target>
        <ActionIcon
          size="sm"
          radius="xl"
          variant="light"
          disabled={!availableActions.length}
        >
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {availableActions.includes("edit") && (
          <Menu.Item
            icon={<IconEdit size={14} />}
            onClick={() => onEditExpense(data, rowIndex)}
            disabled={Boolean(data?.linked)}
          >
            {data?.linked ? "Linked Expense" : "Edit"}
          </Menu.Item>
        )}
        {availableActions.includes("delete") && (
          <Menu.Item
            color="red"
            icon={<IconTrash size={14} />}
            onClick={() => onDeleteExpense(data)}
          >
            Delete
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

export function AmountCell({ value }: ICellRendererParams<IExpense, number>) {
  return (
    <Text
      sx={{ height: "100%", display: "flex", alignItems: "center" }}
      color={!value ? "dimmed" : ""}
      td={!value ? "line-through" : ""}
    >
      {formatCurrency(value)}
    </Text>
  );
}
