import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Menu,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import React from "react";
import {
  IconBookmark,
  IconCalendarCode,
  IconCalendarTime,
  IconChevronRight,
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { memo, useMemo } from "react";
import { primaryColor } from "../constants/app";
import { Icons } from "../constants/categories";
import { formatCurrency } from "../utils";
import ExpenseDescription from "./ExpenseDescription";
import { useExpenseStyles } from "../theme/modules/expenseCard.styles";
dayjs.extend(relativeTime);

type ExpenseAction = (e: IExpense) => void;
interface ReadOnlyCard {
  data: IExpense;
  hideMenu: true;
  onEditExpense?: ExpenseAction;
  onDeleteExpense?: ExpenseAction;
}

interface ActionableCard {
  data: IExpense;
  hideMenu: false;
  onEditExpense: ExpenseAction;
  onDeleteExpense: ExpenseAction;
}

function ExpenseCard({
  data,
  onEditExpense,
  onDeleteExpense,
  hideMenu,
}: ActionableCard | ReadOnlyCard) {
  const { classes } = useExpenseStyles();

  const isEditable = useMemo(
    () => dayjs(data.date) >= dayjs().subtract(7, "days"),
    [data.date]
  );

  const Icon = useMemo(
    () => (data.category ? Icons[data.category.icon] : IconX),
    [data.category]
  );

  return (
    <Box className={classes.wrapper}>
      <Group
        noWrap
        spacing={0}
        position="apart"
        align="flex-start"
        sx={{ height: "100%" }}
      >
        <Group
          spacing={6}
          sx={{
            flexGrow: 1,
            height: "100%",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <Text fw="bold" fz="sm">
            {data.title}
          </Text>
          {data.description && (
            <ExpenseDescription color="dimmed" fz="sm">
              {data.description}
            </ExpenseDescription>
          )}
          <Badge
            variant="light"
            size="sm"
            color={data.category?.color}
            leftSection={<Icon size={12} style={{ marginBottom: -2 }} />}
            mt={4}
          >
            {data.category?.group}{" "}
            <IconChevronRight size={12} style={{ marginBottom: -2 }} />{" "}
            {data.category?.label}
          </Badge>
          <Group position="apart" align="center" mt={4}>
            <Tooltip
              position="top"
              disabled={hideMenu}
              events={{ touch: true, hover: true, focus: false }}
              label={
                <Text fz="xs">
                  {dayjs(data.date).format("DD MMM 'YY hh:mm a")}
                </Text>
              }
            >
              <Badge color="dark" size="sm" variant="filled">
                {hideMenu
                  ? dayjs(data.date).format("DD MMM 'YY hh:mm a")
                  : dayjs(data.date).fromNow()}
              </Badge>
            </Tooltip>
            <Text fz="lg" fw="bold" mt="auto">
              {formatCurrency(data.amount)}
            </Text>
          </Group>
        </Group>
        <Group sx={{ flexDirection: "column" }} spacing={6}>
          {!hideMenu && (
            <Menu shadow="md" position="bottom-end">
              <Menu.Target>
                <ActionIcon size="sm" radius="xl" variant="light">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {isEditable && (
                  <Menu.Item
                    icon={<IconEdit size={14} />}
                    onClick={() => onEditExpense?.(data)}
                    disabled={Boolean(data.linked)}
                  >
                    {data.linked ? "Linked Expense" : "Edit"}
                  </Menu.Item>
                )}
                {isEditable && (
                  <Menu.Item
                    color="red"
                    icon={<IconTrash size={14} />}
                    onClick={() => onDeleteExpense?.(data)}
                  >
                    Delete
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
          {dayjs(data.date).month() !== dayjs().month() && (
            <Tooltip
              position="left"
              events={{ touch: true, hover: true, focus: false }}
              label={
                <Text component="span" fw="normal" size="sm">
                  From {dayjs().subtract(1, "month").format("MMMM")}.
                </Text>
              }
            >
              <ThemeIcon radius="lg" size="sm" color="orange" variant="light">
                <IconCalendarTime size={14} stroke={1.5} />
              </ThemeIcon>
            </Tooltip>
          )}
          {data.linked && (
            <Tooltip
              position="left"
              events={{ touch: true, hover: true, focus: false }}
              label={
                <Text component="span" fw="normal" size="sm">
                  Created in a plan.
                </Text>
              }
            >
              <ThemeIcon
                radius="lg"
                size="sm"
                color={primaryColor}
                variant="light"
              >
                <IconCalendarCode size={14} stroke={1.5} />
              </ThemeIcon>
            </Tooltip>
          )}
          {!data.amount && (
            <Tooltip
              position="left"
              events={{ touch: true, hover: true, focus: false }}
              label={
                <Text component="span" fw="normal" size="sm">
                  Created to keep record; no money spent.
                </Text>
              }
            >
              <ThemeIcon
                radius="lg"
                size="sm"
                color={primaryColor}
                variant="light"
              >
                <IconBookmark size={14} stroke={1.5} />
              </ThemeIcon>
            </Tooltip>
          )}
        </Group>
      </Group>
    </Box>
  );
}

export default memo(
  ExpenseCard,
  (prev, next) => JSON.stringify(prev.data) === JSON.stringify(next.data)
);
