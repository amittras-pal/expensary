import { ActionIcon, Box, Divider, Menu, Text, TextProps } from "@mantine/core";
import {
  IconDotsVertical,
  IconEdit,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePlanStyles } from "../../../theme/modules/plan.styles";

type PlanAction = (
  data: IExpensePlan,
  mode: "edit" | "delete" | "close"
) => void;

interface ReadOnlyCard {
  data: IExpensePlan;
  hideMenu: true;
  onPlanAction?: PlanAction;
}

interface ActionableCard {
  data: IExpensePlan;
  hideMenu: false;
  onPlanAction: PlanAction;
}

export default function ExpensePlan({
  data,
  onPlanAction,
  hideMenu,
}: ActionableCard | ReadOnlyCard) {
  const { classes } = usePlanStyles();

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

          <Text size="xs" color="dimmed" sx={{ whiteSpace: "pre-wrap" }}>
            {data.description}
          </Text>
        </Box>
        {!hideMenu && (
          <>
            {data?.open ? (
              <Menu shadow="md" position="bottom-end">
                <Menu.Target>
                  <ActionIcon size="sm" radius="xl" variant="light">
                    <IconDotsVertical size={16} />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Item
                    icon={<IconEdit size={14} />}
                    onClick={() => onPlanAction(data, "edit")}
                  >
                    Edit
                  </Menu.Item>
                  <Menu.Item
                    color="red"
                    icon={<IconX size={14} />}
                    onClick={() => onPlanAction(data, "close")}
                  >
                    Close
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            ) : (
              <ActionIcon
                color="red"
                variant="light"
                radius="xl"
                onClick={() => onPlanAction(data, "delete")}
              >
                <IconTrash size={16} />
              </ActionIcon>
            )}
          </>
        )}
        {/* {data.open && !hideMenu && (
          <Menu shadow="md" position="bottom-end">
            <Menu.Target>
              <ActionIcon size="sm" radius="xl" variant="light">
                <IconDotsVertical size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                icon={<IconEdit size={14} />}
                onClick={() => onPlanAction(data, "edit")}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                color="red"
                icon={<IconTrash size={14} />}
                onClick={() => onPlanAction(data, "delete")}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )} */}
      </Box>
      <Divider mb="sm" mt="auto" />
      <Text size="sm">
        Last Updated: {dayjs(data.updatedAt).format("DD MMM 'YY, hh:mm a")}
      </Text>
    </Box>
  );
}
