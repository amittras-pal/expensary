import { Dispatch, SetStateAction } from "react";
import {
  ActionIcon,
  Burger,
  Image,
  Kbd,
  Modal,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { IconKeyboard, IconSearch, IconTallymark1 } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useMediaMatch } from "../../hooks/media-match";
import { useTitleMonitor } from "../../hooks/title";
import logoPath from "../../resources/app-logo.svg";
import ShortcutsList from "./ShortcutsList";

type AppHeaderProps = {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

export default function AppHeader(props: Readonly<AppHeaderProps>) {
  const theme = useMantineTheme();
  const title = useTitleMonitor();
  const isMobile = useMediaMatch();

  const [showShortcuts, shortcuts] = useDisclosure(false);
  useHotkeys([["i", shortcuts.open]]);

  return (
    <>
      <Burger
        hiddenFrom="sm"
        opened={props.sidebarOpen}
        onClick={() => props.setSidebarOpen((o) => !o)}
        size="sm"
        color={theme.colors.gray[6]}
        mr={6}
      />
      <ThemeIcon
        color="gray"
        mr={8}
        size={28}
        variant="outline"
        style={{ borderColor: theme.colors.dark[4] }}
      >
        <Image src={logoPath} />
      </ThemeIcon>
      <Text fw="bold" component={Link} to="/" style={{ whiteSpace: "nowrap" }}>
        {title[0]}
      </Text>
      <IconTallymark1 size={24} stroke={1} />
      <Tooltip label={title[1]} disabled={!isMobile} color="dark">
        <Text fz="sm" fw={400} c="dimmed" mr="auto" lineClamp={1}>
          {title[1]}
        </Text>
      </Tooltip>

      {!isMobile && (
        <Tooltip
          label={
            <Text>
              Keyboard Shortcuts <Kbd mb="xs">i</Kbd>
            </Text>
          }
          position="bottom"
          color="dark"
          withArrow
        >
          <ActionIcon
            mr="xs"
            size="md"
            variant="default"
            radius="lg"
            color={theme.primaryColor}
            onClick={shortcuts.open}
          >
            <IconKeyboard size={18} />
          </ActionIcon>
        </Tooltip>
      )}
      <Tooltip label="Search Expenses" position="bottom" withArrow color="dark">
        <ActionIcon
          size="md"
          variant="default"
          radius="lg"
          color={theme.primaryColor}
          component={Link}
          to="/search"
        >
          <IconSearch size={16} />
        </ActionIcon>
      </Tooltip>
      <Modal
        size="lg"
        title="Keyboard Shortcuts"
        opened={showShortcuts}
        onClose={shortcuts.close}
      >
        <ShortcutsList />
      </Modal>
    </>
  );
}
