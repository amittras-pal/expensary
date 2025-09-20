import { Suspense, useState } from "react";
import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import OverlayLoader from "../../components/loaders/OverlayLoader";
import classes from "../../theme/modules/Layout.module.scss";
import AuthGuard from "../guards/AuthGuard";
import AppHeader from "./AppHeader";
import AppNavigation from "./AppNavigation";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 60,
          breakpoint: "sm",
          collapsed: { mobile: !sidebarOpen },
        }}
        padding="md"
      >
        <AppShell.Header
          className={classes.header}
          style={(theme) => ({ backgroundColor: theme.colors.dark[8] })}
        >
          <AppHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppShell.Header>
        <AppShell.Navbar
          style={(theme) => ({ backgroundColor: theme.colors.dark[8] })}
        >
          <AppNavigation
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </AppShell.Navbar>
        {/* App Content */}
        <AppShell.Main
          style={(theme) => ({
            backgroundColor: theme.colors.dark[8],
            border: "none",
          })}
        >
          <Suspense fallback={<OverlayLoader visible />}>
            <Outlet />
          </Suspense>
        </AppShell.Main>
      </AppShell>
    </AuthGuard>
  );
}
