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
}: Readonly<IHeaderParams<IExpense>>) {
  const { primaryColor } = useMantineTheme();
  return (
    <Group justify="flex-start" style={{ width: "100%" }} gap="xs">
      <Text fw="bold" mr="auto" fz="sm">
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
          onClick={(e: MouseEvent) =>
            showColumnMenu(e.currentTarget as HTMLElement)
          }
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
          onClick={(e: KeyboardEvent) =>
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

export function RowCountHeader({ api }: Readonly<IHeaderParams<IExpense>>) {
  return (
    <Text component="span" mx="auto" fw="bold" c="red" fz="sm">
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
        <Text c="dimmed" fz="xs">
          Expense Description
        </Text>
      </Popover.Dropdown>
    </Popover>
  );
}
