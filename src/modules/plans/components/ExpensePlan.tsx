import { useMemo } from "react";
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Group,
  Menu,
  Text,
  TextProps,
} from "@mantine/core";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { primaryColor } from "../../../constants/app";
import { IExpensePlanAggregate } from "../../../services/plans.service";
import classes from "../../../theme/modules/plan.module.scss";
import { formatCurrency } from "../../../utils";

type PlanAction = (
  data: IExpensePlanAggregate,
  mode: "edit" | "delete" | "close"
) => void;

interface ReadOnlyCard {
  data: IExpensePlanAggregate;
  hideMenu: true;
  onPlanAction?: PlanAction;
}

interface ActionableCard {
  data: IExpensePlanAggregate;
  hideMenu: false;
  onPlanAction: PlanAction;
}

export default function ExpensePlan({
  data,
  onPlanAction,
  hideMenu,
}: ActionableCard | ReadOnlyCard) {
  const textProps = useMemo(
    (): Partial<TextProps> => ({
      fz: "md",
      fw: "bold",
      m: 0,
      td: !data.open ? "line-through" : "",
      c: !data.open ? "dimmed" : "",
    }),
    [data.open]
  );

  const isActiveNow = useMemo(() => {
    const from = data.executionRange?.from;
    const to = data.executionRange?.to;
    if (!from || !to) return false;
    const now = dayjs();
    return (
      now.isAfter(dayjs(from).startOf("day")) &&
      now.isBefore(dayjs(to).endOf("day"))
    );
  }, [data.executionRange?.from, data.executionRange?.to]);

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.details}>
        <Box>
          {hideMenu ? (
            <Text {...textProps} component={"p"}>
              {data.name}
            </Text>
          ) : (
            <Text {...textProps} component={Link} to={`/plans/${data._id}`}>
              {data.name}
            </Text>
          )}

          <Text size="xs" c="dimmed" style={{ whiteSpace: "pre-wrap" }}>
            {data.description}
          </Text>
        </Box>
        {!hideMenu && (
          <Menu shadow="md" position="bottom-end">
            <Menu.Target>
              <ActionIcon
                size="sm"
                radius="xl"
                variant="transparent"
                color="gray"
              >
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconEdit size={14} />}
                onClick={() => onPlanAction(data, "edit")}
              >
                Edit
              </Menu.Item>
              {data.open ? (
                <Menu.Item
                  color="red"
                  leftSection={<IconX size={14} />}
                  onClick={() => onPlanAction(data, "close")}
                >
                  Close
                </Menu.Item>
              ) : (
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={14} />}
                  onClick={() => onPlanAction(data, "delete")}
                >
                  Delete
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        )}
      </Box>
      <Divider mb="sm" mt="auto" />
      <Group gap="xs">
        {data.executionRange?.from && data.executionRange?.to && (
          <Badge variant="light" color={primaryColor} size="sm">
            {`${dayjs(data.executionRange.from).format("DD MMM, 'YY")} - ${dayjs(
              data.executionRange.to
            ).format("DD MMM, 'YY")}`}
          </Badge>
        )}
        {isActiveNow && (
          <Badge variant="light" color="green" size="sm">
            Ongoing
          </Badge>
        )}
        <Text fw="bold" fz="sm" ml="auto">
          {formatCurrency(data.totalExpense)}
        </Text>
      </Group>
    </Box>
  );
}
