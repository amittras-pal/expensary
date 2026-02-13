import {
  Box,
  Divider,
  Kbd,
  SimpleGrid,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { IconMapPinFilled } from "@tabler/icons-react";
import { useLocation } from "react-router-dom";
import { planDetailsPath } from "../../constants/app";
import { ROUTES } from "../../constants/routes";

export default function ShortcutsList() {
  const { pathname } = useLocation();
  const { primaryColor } = useMantineTheme();

  return (
    <>
      <Text fz="md" fw="bold" mb="sm">
        Global
      </Text>
      <Text fz="xs" mb="xs">
        <Kbd>I</Kbd> - Open Keyboard Shortcuts.
      </Text>
      <Divider my="sm" />
      <Text fz="md" fw="bold" mb="sm">
        Navigation
      </Text>
      {ROUTES.map((route) => (
        <Text fz="xs" mb="xs" key={route.path}>
          <Kbd>{route.shortcut}</Kbd> - Navigate to "{route.label}".
        </Text>
      ))}
      <Divider my="sm" />
      <SimpleGrid cols={2} spacing="sm" mb="sm">
        <Box mb="sm">
          <Text
            fz="md"
            fw="bold"
            mb="sm"
            c={pathname === "/" ? primaryColor : ""}
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
        <Box mb="sm">
          <Text
            fz="md"
            fw="bold"
            mb="sm"
            c={pathname === "/expenses" ? primaryColor : ""}
          >
            Expenses List {pathname === "/expenses" && <YouAreHere />}
          </Text>
          <Text fz="xs" mb="xs">
            <Kbd>X</Kbd> - Clear Applied Filters on Table.
          </Text>
        </Box>
        <Box mb="sm">
          <Text
            fz="md"
            fw="bold"
            mb="sm"
            c={pathname === "/plans" ? primaryColor : ""}
          >
            Plans List {pathname === "/plans" && <YouAreHere />}
          </Text>
          <Text fz="xs" mb="xs">
            <Kbd>N</Kbd> - Create New Plan.
          </Text>
        </Box>
        <Box mb="sm">
          <Text
            fz="md"
            fw="bold"
            mb="sm"
            c={RegExp(planDetailsPath).exec(pathname) ? primaryColor : ""}
          >
            Plan Details{" "}
            {RegExp(planDetailsPath).exec(pathname) && <YouAreHere />}
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
  const { primaryColor } = useMantineTheme();
  return (
    <ThemeIcon
      c={primaryColor}
      variant="light"
      size="sm"
      radius="lg"
      component="span"
    >
      <IconMapPinFilled size={12} />
    </ThemeIcon>
  );
}
