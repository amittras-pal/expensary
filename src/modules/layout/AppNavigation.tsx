import { Dispatch, SetStateAction, useMemo, useRef } from "react";
import {
  AppShell,
  Group,
  Kbd,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { modals } from "@mantine/modals";
import { IconLogout, IconPower } from "@tabler/icons-react";
import { Link, useLocation } from "react-router-dom";
import AppInfo from "../../components/app-info/AppInfo";
import { ROUTES } from "../../constants/routes";
import { useLogoutHandler } from "../../hooks/logout";
import { useMediaMatch } from "../../hooks/media-match";
import classes from "../../theme/modules/Layout.module.scss";

type AppNavigationProps = {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
};

export default function AppNavigation(props: Readonly<AppNavigationProps>) {
  const isMobile = useMediaMatch();
  const { logout, loggingOut } = useLogoutHandler();
  const confirmLogout = () => {
    modals.openConfirmModal({
      title: "Confirm Logout",
      children: <Text c="red">Are you sure you want to logout?</Text>,
      withCloseButton: false,
      closeOnCancel: true,
      labels: { confirm: "Yes", cancel: "No" },
      confirmProps: {
        variant: "filled",
        color: "red",
        loading: loggingOut,
        leftSection: <IconLogout />,
      },
      onConfirm: logout,
    });
  };

  return (
    <>
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
            onChange={() => {
              props.setSidebarOpen(false);
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
          <UnstyledButton onClick={confirmLogout} className={classes.navBtn}>
            <ThemeIcon variant={"light"} color="red" size={36}>
              <IconPower size={20} />
            </ThemeIcon>
            {isMobile && <Text size="sm">Log Out</Text>}
          </UnstyledButton>
        </Tooltip>
        <AppInfo type={isMobile ? "text" : "menu"} />
      </AppShell.Section>
    </>
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
          active ? `${classes.navBtn} ${classes.navBtnActive}` : classes.navBtn
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
