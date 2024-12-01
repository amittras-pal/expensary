import { MantineProvider } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
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
      withGlobalStyles
      withNormalizeCSS
      withCSSVariables
      theme={{ ...theme, primaryColor: color }}
    >
      <PreLoader>
        <ModalsProvider>
          <UserProvider>
            <Notifications position="top-center" autoClose={3500} />
            {/* Monitors */}
            <BudgetMonitor />
            <ThemeMonitor />
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
