import { Suspense, useMemo } from "react";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import '@mantine/notifications/styles.css';
import { useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { Outlet } from "react-router-dom";
import OverlayLoader from "./components/loaders/OverlayLoader";
import PreLoader from "./components/loaders/PreLoader";
import BudgetMonitor from "./components/monitors/BudgetMonitor";
import NetworkMonitor from "./components/monitors/NetworkMonitor";
import ThemeMonitor from "./components/monitors/ThemeMonitor";
import TimezoneMonitor from "./components/monitors/TimezoneMonitor";
import { primaryColor } from "./constants/app";
import UserProvider from "./context/user.context";
import "./theme/globals.scss";

const theme = createTheme({
  defaultRadius: "sm",
  fontFamily: "'Poppins', sans-serif",
  fontFamilyMonospace: "Monaco, Courier, monospace",
  cursorType: "pointer",
  focusRing: "auto",
});

export default function App() {
  const [color] = useLocalStorage({
    key: "primary-color",
    defaultValue: primaryColor,
  });

  const componentDefaults = useMemo(
    () => ({
      Button: { defaultProps: { color } },
      Progress: { defaultProps: { color } },
      Slider: { defaultProps: { color } },
      TextInput: { defaultProps: { mb: "sm", variant: "filled" } },
      Textarea: { defaultProps: { mb: "sm", variant: "filled" } },
      Select: { defaultProps: { mb: "sm", variant: "filled" } },
      DateTimePicker: { defaultProps: { mb: "sm", variant: "filled" } },
      DatePicker: { defaultProps: { mb: "sm", variant: "filled" } },
      DatePickerInput: { defaultProps: { mb: "sm", variant: "filled" } },
      Divider: { defaultProps: { variant: "dashed" } },
      ScrollArea: { defaultProps: { scrollbarSize: 6 } },
      Tooltip: {
        defaultProps: { events: { hover: true, touch: true, focus: true } },
      },
    }),
    [color]
  );

  return (
    <MantineProvider
      defaultColorScheme="dark"
      cssVariablesSelector="html"
      withCssVariables
      theme={{
        ...theme,
        primaryColor: color ?? "indigo",
        components: componentDefaults,
        focusRing: "auto",
      }}
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
