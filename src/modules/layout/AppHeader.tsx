import {
  ActionIcon,
  Burger,
  Header,
  Image,
  Kbd,
  MediaQuery,
  Modal,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import {
  IconChevronRight,
  IconExclamationMark,
  IconLogout,
  IconPower,
} from "@tabler/icons-react";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { APP_TITLE } from "../../constants/app";
import { useLogoutHandler } from "../../hooks/logout";
import { useMediaMatch } from "../../hooks/media-match";
import logoPath from "../../resources/app-logo.svg";
import { useAppStyles } from "../../theme/modules/layout.styles";
import ShortcutsList from "./ShortcutsList";

interface IAppHeaderProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AppHeader({ open, setOpen }: IAppHeaderProps) {
  const { classes } = useAppStyles();
  const theme = useMantineTheme();
  const [title, setTitle] = useState([APP_TITLE, "Dashboard"]);
  const isMobile = useMediaMatch();
  const [showShortcuts, shortcuts] = useDisclosure(false);
  useHotkeys([["i", shortcuts.open]]);
  const { logoutUser } = useLogoutHandler();

  const titleHandler = useCallback((entries: MutationRecord[]) => {
    const nodeVal = entries.at(0)?.addedNodes.item(0)?.nodeValue ?? "";
    const pageTitle = nodeVal?.split("|").map((part) => part.trim()) ?? [];
    setTitle(pageTitle);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(titleHandler);
    observer.observe(document.querySelector("title")!, {
      childList: true,
      subtree: false,
    });
    return () => {
      observer.disconnect();
    };
  }, [titleHandler]);

  const confirmLogout = () =>
    modals.openConfirmModal({
      title: "Confirm Logout",
      children: <Text color="red">Are you sure you want to logout?</Text>,
      withCloseButton: false,
      closeOnCancel: true,
      labels: {
        confirm: "Yes",
        cancel: "No",
      },
      confirmProps: {
        variant: "filled",
        color: "red",
        leftIcon: <IconLogout />,
      },
      onConfirm: logoutUser,
    });

  return (
    <>
      <Header height={60} className={classes.header}>
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={open}
            onClick={() => setOpen((o) => !o)}
            size="sm"
            color={theme.colors.gray[6]}
            mr="md"
          />
        </MediaQuery>
        <ThemeIcon
          color="gray"
          mr={8}
          size={28}
          variant="outline"
          sx={(theme) => ({ borderColor: theme.colors.dark[4] })}
        >
          <Image src={logoPath} />
        </ThemeIcon>
        <Text
          fz="lg"
          fw="bold"
          mr={4}
          component={Link}
          to="/"
          sx={{ whiteSpace: "nowrap" }}
        >
          {title[0]} <IconChevronRight size={14} />
        </Text>
        <Tooltip label={title[1]} disabled={!isMobile} color="dark">
          <Text fz="sm" fw={400} color="dimmed" mr="auto" lineClamp={1}>
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
              <IconExclamationMark size={18} />
            </ActionIcon>
          </Tooltip>
        )}
        <Tooltip label="Log Out" position="bottom" withArrow color="dark">
          <ActionIcon
            size="md"
            variant="default"
            radius="lg"
            color="red"
            onClick={confirmLogout}
          >
            <IconPower size={18} />
          </ActionIcon>
        </Tooltip>
      </Header>
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
