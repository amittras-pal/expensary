import {
  ActionIcon,
  AppShell,
  Group,
  Image,
  Kbd,
  Modal,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import {
  IconKeyboard,
  IconLogout,
  IconPower,
  IconSearch,
  IconTallymark1,
} from "@tabler/icons-react";
import { Suspense, useMemo, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import OverlayLoader from "../../components/loaders/OverlayLoader";
import { useMediaMatch } from "../../hooks/media-match";
import { useTitleMonitor } from "../../hooks/title";
import logoPath from "../../resources/app-logo.svg";
import styles from "../../theme/modules/Layout.module.css";
import AuthGuard from "../guards/AuthGuard";
import ShortcutsList from "./ShortcutsList";
import { ROUTES } from "../../constants/routes";
import { modals } from "@mantine/modals";
import AppInfo from "../../components/app-info/AppInfo";
import { useLogoutHandler } from "../../hooks/logout";

export default function Layout() {
  const [open, setOpen] = useState(false);
  const theme = useMantineTheme();
  const title = useTitleMonitor();
  const isMobile = useMediaMatch();
  const [showShortcuts, shortcuts] = useDisclosure(false);
  useHotkeys([["i", shortcuts.open]]);

  const { logout, loggingOut } = useLogoutHandler();
  const confirmLogout = () =>
    modals.openConfirmModal({
      title: "Confirm Logout",
      children: <Text c="red">Are you sure you want to logout?</Text>,
      withCloseButton: false,
      closeOnCancel: true,
      labels: {
        confirm: "Yes",
        cancel: "No",
      },
      confirmProps: {
        variant: "filled",
        color: "red",
        loading: loggingOut,
        leftSection: <IconLogout />,
      },
      onConfirm: logout,
    });

  return (
    <AuthGuard>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 60, breakpoint: "sm", collapsed: { mobile: !open } }}
        padding="md"
      >
        <AppShell.Header className={styles.header}>
          {/* <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={open}
            onClick={() => setOpen((o) => !o)}
            size="sm"
            color={theme.colors.gray[6]}
            mr={6}
          />
        </MediaQuery> */}
          <ThemeIcon
            color="gray"
            mr={8}
            size={28}
            variant="outline"
            style={{ borderColor: theme.colors.dark[4] }}
          >
            <Image src={logoPath} />
          </ThemeIcon>
          <Text
            fw="bold"
            component={Link}
            to="/"
            style={{ whiteSpace: "nowrap" }}
          >
            {title[0]}
          </Text>
          <IconTallymark1 size={24} stroke={1} />
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
                <IconKeyboard size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          <Tooltip
            label="Search Expenses"
            position="bottom"
            withArrow
            color="dark"
          >
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
        </AppShell.Header>
        <AppShell.Navbar>
          <AppShell.Section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "center",
              justifyContent: "flex-start",
              padding: 11,
              flexGrow: 1,
            }}
          >
            {ROUTES.map((route) => (
              <NavLink
                {...route}
                key={route.label}
                onChange={(e) => {
                  console.log(e);
                }}
              />
            ))}
          </AppShell.Section>
          <AppShell.Section
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              alignItems: "center",
              justifyContent: "center",
              padding: 11,
            }}
          >
            <Tooltip
              label="Log Out"
              position="right"
              events={{ focus: true, hover: true, touch: false }}
              disabled={isMobile}
              offset={10}
            >
              <UnstyledButton onClick={confirmLogout} className={styles.navBtn}>
                <ThemeIcon variant={"light"} color="red" size={36}>
                  <IconPower size={20} />
                </ThemeIcon>
                {isMobile && <Text size="sm">Log Out</Text>}
              </UnstyledButton>
            </Tooltip>
            <AppInfo
              onLinkClick={() => {
                console.log("Not Implemented.");
              }}
              type={isMobile ? "text" : "menu"}
            />
          </AppShell.Section>
        </AppShell.Navbar>
        {/* App Content */}
        <AppShell.Main>
          <Suspense fallback={<OverlayLoader visible />}>
            <Outlet />
          </Suspense>
        </AppShell.Main>
        {/* Modals & Overlays */}
        <Modal
          size="lg"
          title="Keyboard Shortcuts"
          opened={showShortcuts}
          onClose={shortcuts.close}
        >
          <ShortcutsList />
        </Modal>
      </AppShell>
    </AuthGuard>
  );
}

type NavLinkProps = RouteItem & {
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
};
function NavLink({ onChange, ...route }: NavLinkProps) {
  const { pathname } = useLocation();
  const ref = useRef<HTMLAnchorElement>(null);
  const isMobile = useMediaMatch();

  const active = useMemo(() => {
    return route.exactMatch
      ? pathname === route.path
      : pathname.includes(route.path);
  }, [route, pathname]);

  const navigateViaShortcut = () => {
    if (!active && !isMobile) ref.current?.click();
  };
  useHotkeys([[route.shortcut, navigateViaShortcut]]);

  return (
    <Tooltip
      label={
        <Group gap={6}>
          <Text fz="sm">{route.label}</Text>
          <Kbd ml="auto">{route.shortcut}</Kbd>
        </Group>
      }
      offset={10}
      position="right"
      disabled={isMobile}
      events={{ focus: true, hover: true, touch: false }}
    >
      <UnstyledButton
        ref={ref}
        component={Link}
        onClick={() => onChange(false)}
        to={route.path}
        className={
          active ? `${styles.navBtn} ${styles.navBtnActive}` : styles.navBtn
        }
      >
        <ThemeIcon variant={active ? "filled" : "light"} size={36}>
          {route.icon}
        </ThemeIcon>
        {isMobile && <Text size="sm">{route.label}</Text>}
      </UnstyledButton>
    </Tooltip>
  );
}
