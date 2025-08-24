import {
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
import { modals } from "@mantine/modals";
import { IconLogout, IconPower } from "@tabler/icons-react";
import { useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import AppInfo from "../../components/app-info/AppInfo";
import { ROUTES } from "../../constants/routes";
import { useLogoutHandler } from "../../hooks/logout";
import { useMediaMatch } from "../../hooks/media-match";
import {
  useAppStyles,
  useNavBtnStyle,
} from "../../theme/modules/layout.styles";

type RouteChange = {
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
};
type NavLinkProps = RouteItem & RouteChange;
type SidebarProps = Omit<HorizontalSectionSharedProps, "children"> &
  RouteChange;

export default function AppNavigation({ onChange, ...rest }: SidebarProps) {
  const { classes } = useAppStyles();
  const { classes: btnClasses } = useNavBtnStyle({ active: false });
  const isMobile = useMediaMatch();

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
      p="sm"
      width={{ base: isMobile ? 300 : 60 }}
      hiddenBreakpoint="sm"
      className={classes.navigation}
      {...rest}
    >
      <Navbar.Section
        grow
        sx={(theme) => ({
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.sm,
        })}
      >
        {ROUTES.map((route) => (
          <NavLink {...route} key={route.label} onChange={onChange} />
        ))}
      </Navbar.Section>
      <Navbar.Section
        sx={() => ({
          display: "flex",
          gap: "6px",
          alignItems: "center",
        })}
      >
        <Tooltip
          label="Log Out"
          position="right"
          events={{ focus: true, hover: true, touch: false }}
          disabled={isMobile}
          offset={10}
        >
          <UnstyledButton onClick={confirmLogout} className={btnClasses.navBtn}>
            <ThemeIcon variant={"light"} color="red" size={36}>
              <IconPower size={20} />
            </ThemeIcon>
            {isMobile && <Text size="sm">Log Out</Text>}
          </UnstyledButton>
        </Tooltip>
      </Navbar.Section>
      <Navbar.Section>
        <AppInfo
          onLinkClick={() => onChange(false)}
          type={isMobile ? "text" : "menu"}
          mt="sm"
          position="left"
        />
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
    <Tooltip
      label={
        <Group spacing={6}>
          <Text fz="sm">{route.label}</Text>
          <Kbd ml="auto">{route.shortcut}</Kbd>
        </Group>
      }
      width={170}
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
        className={classes.navBtn}
      >
        <ThemeIcon variant={active ? "filled" : "light"} size={36}>
          {route.icon}
        </ThemeIcon>
        {isMobile && <Text size="sm">{route.label}</Text>}
      </UnstyledButton>
    </Tooltip>
  );
}
