import { Box, Divider, Kbd, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import { IconMapPinFilled } from "@tabler/icons-react";
import React from "react";
import { useLocation } from "react-router-dom";
import { planDetailsPath, primaryColor } from "../../constants/app";
import { useShortcutBlockStyles } from "../../theme/layout.styles";

export default function ShortcutsList() {
  const { pathname } = useLocation();
  const { classes, cx } = useShortcutBlockStyles();

  return (
    <>
      <Text fz="md" fw="bold" mb="sm">
        Global
      </Text>
      <Text fz="xs" mb="xs">
        <Kbd>I</Kbd> - Open Keyboard Shortcuts.
      </Text>
      <Divider my="sm" />
      <SimpleGrid
        cols={2}
        spacing="sm"
        mb="sm"
        breakpoints={[
          { maxWidth: "md", cols: 2, spacing: "sm", verticalSpacing: "sm" },
          { maxWidth: "sm", cols: 1, spacing: "sm", verticalSpacing: "sm" },
        ]}
      >
        <Box
          className={cx(classes.block, {
            [classes.highlight]: pathname === "/",
          })}
        >
          <Text
            fz="md"
            fw="bold"
            mb="sm"
            color={pathname === "/" ? primaryColor : ""}
          >
            Dashboard {pathname === "/" && <YouAreHere />}
          </Text>
          <Text fz="xs" mb="xs">
            <Kbd>N</Kbd> - Create New Expense.
          </Text>
          <Text fz="xs" mb="xs">
            <Kbd>Shift+S</Kbd> - Toggle category selection
          </Text>
        </Box>
        <Box
          className={cx(classes.block, {
            [classes.highlight]: pathname === "/expenses",
          })}
        >
          <Text
            fz="md"
            fw="bold"
            mb="sm"
            color={pathname === "/expenses" ? primaryColor : ""}
          >
            Expenses List {pathname === "/expenses" && <YouAreHere />}
          </Text>
          <Text fz="xs" mb="xs">
            <Kbd>X</Kbd> - Clear Applied Filters on Table.
          </Text>
        </Box>
        <Box
          className={cx(classes.block, {
            [classes.highlight]: pathname === "/plans",
          })}
        >
          <Text
            fz="md"
            fw="bold"
            mb="sm"
            color={pathname === "/plans" ? primaryColor : ""}
          >
            Plans List {pathname === "/plans" && <YouAreHere />}
          </Text>
          <Text fz="xs" mb="xs">
            <Kbd>N</Kbd> - Create New Plan.
          </Text>
        </Box>
        <Box
          className={cx(classes.block, {
            [classes.highlight]: pathname.match(planDetailsPath),
          })}
        >
          <Text
            fz="md"
            fw="bold"
            mb="sm"
            color={pathname.match(planDetailsPath) ? primaryColor : ""}
          >
            Plan Details {pathname.match(planDetailsPath) && <YouAreHere />}
          </Text>
          <Text fz="xs" mb="xs">
            <Kbd>N</Kbd> - Add New Expense to plan.
          </Text>
        </Box>
      </SimpleGrid>
    </>
  );
}

function YouAreHere() {
  return (
    <ThemeIcon color={primaryColor} variant="light" size="sm" radius="lg">
      <IconMapPinFilled size={12} />
    </ThemeIcon>
  );
}
