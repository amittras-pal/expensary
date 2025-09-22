import {
  Box,
  Divider,
  Kbd,
  SimpleGrid,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconMapPinFilled,
} from "@tabler/icons-react";
import { useLocation } from "react-router-dom";
import { planDetailsPath } from "../../constants/app";
import classes from "../../theme/modules/Layout.module.scss";

export default function ShortcutsList() {
  const { pathname } = useLocation();
  const cx = (...classes: (string | false | undefined)[]) =>
    classes.filter(Boolean).join(" ");
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
      <SimpleGrid cols={2} spacing="sm" mb="sm">
        <Box
          className={cx(
            classes.shortcutBlock,
            pathname === "/" && classes.shortcutHighlight
          )}
        >
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
        <Box
          className={cx(
            classes.shortcutBlock,
            pathname === "/expenses" && classes.shortcutHighlight
          )}
        >
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
        <Box
          className={cx(
            classes.shortcutBlock,
            pathname === "/plans" && classes.shortcutHighlight
          )}
        >
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
        <Box
          className={cx(
            classes.shortcutBlock,
            !!RegExp(planDetailsPath).exec(pathname) &&
              classes.shortcutHighlight
          )}
        >
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
        <Box
          className={cx(
            classes.shortcutBlock,
            pathname === "/statistics" && classes.shortcutHighlight
          )}
        >
          <Text
            fz="md"
            fw="bold"
            mb="sm"
            c={pathname === "/statistics" ? primaryColor : ""}
          >
            Spend Statistics {pathname === "/statistics" && <YouAreHere />}
          </Text>
          <Text fz="xs" mb="xs">
            <Kbd>Backspace</Kbd> - In Month View: Go back to yeat view.
          </Text>
          <Text fz="xs" mb="xs">
            <Kbd>
              <IconArrowRight size={14} style={{ marginBottom: -3 }} />
            </Kbd>{" "}
            - In Month View; Go to next month.
          </Text>
          <Text fz="xs" mb="xs">
            <Kbd>
              <IconArrowLeft size={14} style={{ marginBottom: -3 }} />
            </Kbd>{" "}
            - In Month View; Go to previous month.
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
