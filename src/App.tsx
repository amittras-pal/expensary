import { Global, LoadingOverlay, MantineProvider } from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import BudgetMonitor from "./components/monitors/BudgetMonitor";
import Themer from "./components/monitors/Themer";
import TimezoneMonitor from "./components/monitors/TimezoneMonitor";
import { primaryColor } from "./constants/app";
import UserProvider from "./context/user.context";
import ServerConnecting from "./modules/server/ServerConnecting";
import montserratItalic from "./resources/fonts/Montserrat-Italic-VariableFont_wght.ttf";
import montserrat from "./resources/fonts/Montserrat-VariableFont_wght.ttf";
import theme from "./theme";

const GlobalStyles = () => {
  return (
    <Global
      styles={[
        {
          "@font-face": {
            fontFamily: "Montserrat",
            src: `url('${montserrat}') format("ttf")`,
            fontWeight: 700,
            fontStyle: "normal",
          },
        },
        {
          "@font-face": {
            fontFamily: "Montserrat",
            src: `url('${montserratItalic}') format("ttf")`,
            fontWeight: 900,
            fontStyle: "normal",
          },
        },
      ]}
    />
  );
};

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
      <GlobalStyles />
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
