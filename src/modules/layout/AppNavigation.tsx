import {
  Group,
  Kbd,
  Navbar,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { HorizontalSectionSharedProps } from "@mantine/core/lib/AppShell/HorizontalSection/HorizontalSection";
import { useHotkeys } from "@mantine/hooks";
import React, { useMemo, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { primaryColor } from "../../constants/app";
import { ROUTES } from "../../constants/routes";
import { useMediaMatch } from "../../hooks/media-match";
import { useAppStyles, useNavBtnStyle } from "./styles";

type RouteChange = {
  onChange: React.Dispatch<React.SetStateAction<boolean>>;
};
type NavLinkProps = RouteItem & RouteChange;
type SidebarProps = Omit<HorizontalSectionSharedProps, "children"> &
  RouteChange;

export default function AppNavigation({ onChange, ...rest }: SidebarProps) {
  const { classes } = useAppStyles();
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
        <ThemeIcon color={primaryColor} variant={active ? "filled" : "light"}>
          {route.icon}
        </ThemeIcon>
        <Text size="sm">{route.label}</Text>
        {!isMobile && <Kbd ml="auto">{route.shortcut}</Kbd>}
      </Group>
    </UnstyledButton>
  );
}
