import { useMemo } from "react";
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
import dayjs from "dayjs";
import { ICellRendererParams } from "ag-grid-community";
import Highlighter from "react-highlight-words";
import { useCurrentUser } from "../../../context/user.context";
import { formatCurrency } from "../../../utils";
import { MenuCellProps, MetaCellProps } from "../interfaces";
import { amountColor } from "./utils";

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
          <Group gap={6} style={{ alignItems: "flex-start" }}>
            <ThemeIcon
              radius="sm"
              size="sm"
              color={primaryColor}
              variant="filled"
            >
              <IconInfoCircle size={14} stroke={1.5} />
            </ThemeIcon>
            <Text
              component="p"
              c="dimmed"
              fz="xs"
              style={{ whiteSpace: "pre-wrap" }}
              m={0}
            >
              {data?.description}
            </Text>
          </Group>
        )}
        {data?.linked && (
          <Group gap={6} style={{ alignItems: "flex-start" }} mt={6}>
            <ThemeIcon
              radius="sm"
              size="sm"
              color={primaryColor}
              variant="filled"
            >
              <IconCalendarCode size={14} stroke={1.5} />
            </ThemeIcon>
            <Text component="span" fz="xs" c="dimmed">
              {page === "budget" ? "Created in a plan." : "Copied to Budget."}
            </Text>
          </Group>
        )}
        {!data?.amount && (
          <Group gap={6} style={{ alignItems: "flex-start" }} mt={6}>
            <ThemeIcon
              radius="sm"
              size="sm"
              color={primaryColor}
              variant="filled"
            >
              <IconBookmark size={14} stroke={1.5} />
            </ThemeIcon>
            <Text component="span" size="xs" c="dimmed">
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
}: Readonly<ICellRendererParams<IExpense, string>>) {
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
          variant="transparent"
          color="gray"
          disabled={!availableActions.length}
        >
          <IconDotsVertical size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {availableActions.includes("edit") && (
          <Menu.Item
            leftSection={<IconEdit size={14} />}
            onClick={() => onEditExpense(data, rowIndex)}
            disabled={Boolean(data?.linked)}
          >
            {data?.linked ? "Linked Expense" : "Edit"}
          </Menu.Item>
        )}
        {availableActions.includes("delete") && (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => onDeleteExpense(data)}
          >
            Delete
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

export function AmountCell({
  value,
}: Readonly<ICellRendererParams<IExpense, number>>) {
  return (
    <Text component="span" fw="bold" c={amountColor(value)} fz="sm">
      {formatCurrency(value)}
    </Text>
  );
}

export function TitleCell({
  value,
  api,
}: Readonly<ICellRendererParams<IExpense, string>>) {
  return (
    <Text size="sm" component="div">
      <Highlighter
        searchWords={[api.getFilterInstance("title")?.getModel() ?? ""]}
        textToHighlight={value}
        autoEscape
      />
    </Text>
  );
}
