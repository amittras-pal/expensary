import {
  ActionIcon,
  Group,
  Popover,
  Text,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowsSort,
  IconFilter,
  IconInfoCircle,
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { IHeaderParams } from "ag-grid-community";
import { getNextSortOrder } from "./utils";

export function ColumnHeader({
  api,
  column,
  displayName,
  enableMenu,
  enableSorting,
  showColumnMenu,
  setSort,
}: IHeaderParams<IExpense>) {
  const { primaryColor } = useMantineTheme();
  return (
    <Group position="left" sx={{ width: "100%" }} spacing="xs">
      <Text fw="bold" mr="auto">
        {displayName}
      </Text>
      {enableMenu && (
        <ActionIcon
          size="md"
          radius="xl"
          color={
            api.getFilterInstance(column.getColId())?.isFilterActive()
              ? primaryColor
              : "gray"
          }
          variant={"filled"}
          onClick={(e) => showColumnMenu(e.currentTarget)}
        >
          <IconFilter size={16} />
        </ActionIcon>
      )}
      {enableSorting && (
        <ActionIcon
          size="md"
          radius="xl"
          color={
            column.isSortAscending() || column.isSortDescending()
              ? primaryColor
              : "gray"
          }
          variant={"filled"}
          onClick={(e) =>
            setSort(getNextSortOrder(column.getSort()), e.shiftKey)
          }
        >
          {!column.getSort() && <IconArrowsSort size={16} />}
          {column.getSort() === "asc" && <IconSortAscending size={16} />}
          {column.getSort() === "desc" && <IconSortDescending size={16} />}
        </ActionIcon>
      )}
    </Group>
  );
}

export function RowCountHeader({ api }: IHeaderParams<IExpense>) {
  return (
    <Text component="span" mx="auto" color="red" fw="bold">
      {api.getDisplayedRowCount()}
    </Text>
  );
}

export function MetaHeader() {
  return (
    <Popover withinPortal withArrow shadow="md" width={280} position="bottom">
      <Popover.Target>
        <ActionIcon
          size="sm"
          radius="xl"
          color="orange"
          mx="auto"
          variant="light"
        >
          <IconInfoCircle size={18} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown p={8}>
        <Text color="dimmed" fz="xs">
          Expense Description
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
}
