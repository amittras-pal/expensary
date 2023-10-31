import { LoadingOverlay, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Themer from "./components/monitors/Themer";
import theme from "./theme";
import React from "react";
import { ModalsProvider } from "@mantine/modals";
import ServerConnecting from "./modules/server/ServerConnecting";
import UserProvider from "./context/user.context";
import TimezoneMonitor from "./components/monitors/TimezoneMonitor";
import BudgetMonitor from "./components/monitors/BudgetMonitor";

export default function App() {
  return (
    <MantineProvider
      withGlobalStyles
      withNormalizeCSS
      withCSSVariables
      theme={theme}
    >
      <ServerConnecting>
        <ModalsProvider>
          <UserProvider>
            <Notifications position="top-center" autoClose={3500} />
            {/* Monitors */}
            <BudgetMonitor />
            <Themer />
            <TimezoneMonitor />
            {/* Main App */}
            <Suspense fallback={<LoadingOverlay visible overlayBlur={5} />}>
              <Outlet />
            </Suspense>
          </UserProvider>
        </ModalsProvider>
      </ServerConnecting>
    </MantineProvider>
  );
}
