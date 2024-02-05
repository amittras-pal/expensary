import {
  ActionIcon,
  Group,
  Kbd,
  Navbar,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { HorizontalSectionSharedProps } from "@mantine/core/lib/AppShell/HorizontalSection/HorizontalSection";
import { useHotkeys } from "@mantine/hooks";
import { IconLogout, IconPower, IconUserCog } from "@tabler/icons-react";
import React, { useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../constants/routes";
import { useMediaMatch } from "../../hooks/media-match";
import {
  useAppStyles,
  useNavBtnStyle,
} from "../../theme/modules/layout.styles";
import { modals } from "@mantine/modals";
import { useLogoutHandler } from "../../hooks/logout";

type RouteChange = {
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
};
type NavLinkProps = RouteItem & RouteChange;
type SidebarProps = Omit<HorizontalSectionSharedProps, "children"> &
  RouteChange;

export default function AppNavigation({ onChange, ...rest }: SidebarProps) {
  const { classes } = useAppStyles();
  const { logoutUser } = useLogoutHandler();
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
    <Navbar
      width={{ base: 300 }}
      hiddenBreakpoint="sm"
      className={classes.navigation}
      p="md"
      {...rest}
    >
      <Navbar.Section grow>
        <>
          {ROUTES.map((route) => (
            <NavLink {...route} key={route.label} onChange={onChange} />
          ))}
        </>
      </Navbar.Section>
      <Navbar.Section
        sx={() => ({
          display: "flex",
          gap: "6px",
          alignItems: "center",
        })}
      >
        <NavLink
          icon={<IconUserCog size={16} />}
          label="My Account"
          path="/account"
          shortcut="U"
          exactMatch={false}
          onChange={onChange}
        />
        <Tooltip label="Log Out" position="bottom" withArrow color="dark">
          <ActionIcon
            color="red"
            variant="light"
            size="xl"
            radius="sm"
            onClick={confirmLogout}
          >
            <IconPower size={24} />
          </ActionIcon>
        </Tooltip>
      </Navbar.Section>
    </Navbar>
  );
}

function NavLink({ onChange, ...route }: NavLinkProps) {
  const { pathname } = useLocation();
  const ref = useRef<HTMLAnchorElement>(null);
  const isMobile = useMediaMatch();

  const active = useMemo(() => {
    return route.exactMatch
      ? pathname === route.path
      : pathname.includes(route.path);
  }, [route, pathname]);

  const { classes } = useNavBtnStyle({ active });

  const navigateViaShortcut = () => {
    if (!active && !isMobile) ref.current?.click();
  };
  useHotkeys([[route.shortcut, navigateViaShortcut]]);

  return (
    <UnstyledButton
      ref={ref}
      component={Link}
      onClick={() => onChange(false)}
      to={route.path}
      className={classes.navBtn}
    >
      <Group>
        <ThemeIcon variant={active ? "filled" : "light"}>
          {route.icon}
        </ThemeIcon>
        <Text size="sm">{route.label}</Text>
        {!isMobile && <Kbd ml="auto">{route.shortcut}</Kbd>}
      </Group>
    </UnstyledButton>
  );
}
