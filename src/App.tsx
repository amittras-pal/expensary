// mantine styles.
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
// mantine components.
import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
// mantine hooks.
import { useLocalStorage } from "@mantine/hooks";
// react & core libs
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
// custom components
import OverlayLoader from "./components/loaders/OverlayLoader";
import PreLoader from "./components/loaders/PreLoader";
import BudgetMonitor from "./components/monitors/BudgetMonitor";
import NetworkMonitor from "./components/monitors/NetworkMonitor";
import ThemeMonitor from "./components/monitors/ThemeMonitor";
import TimezoneMonitor from "./components/monitors/TimezoneMonitor";
import { primaryColor } from "./constants/app";
import UserProvider from "./context/user.context";
import theme from "./theme";

export default function App() {
  const [color] = useLocalStorage({
    key: "primary-color",
    defaultValue: primaryColor,
  });

  return (
    <MantineProvider
      defaultColorScheme="dark"
      cssVariablesSelector="html"
      withCssVariables
      theme={{ ...theme, primaryColor: color ?? "indigo" }}
    >
      <ThemeMonitor />
      <PreLoader>
        <ModalsProvider>
          <UserProvider>
            <Notifications position="top-center" autoClose={3500} />
            {/* Monitors */}
            <BudgetMonitor />
            <TimezoneMonitor />
            <NetworkMonitor />
            {/* Main App */}
            <Suspense fallback={<OverlayLoader visible />}>
              <Outlet />
            </Suspense>
          </UserProvider>
        </ModalsProvider>
      </PreLoader>
    </MantineProvider>
  );
}
