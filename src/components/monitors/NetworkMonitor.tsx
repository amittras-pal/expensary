import { Notification } from "@mantine/core";
import { IconWifi, IconWifiOff } from "@tabler/icons-react";
import { useNetworkState } from "../../hooks/network";

export default function NetworkMonitor() {
  const { isOnline, reConnected } = useNetworkState();
  return (
    <Notification
      icon={!isOnline ? <IconWifiOff size={16} /> : <IconWifi size={16} />}
      color={!isOnline ? "red" : "green"}
      title={!isOnline ? "Network Disconnected!" : "Back Online!"}
      withCloseButton={false}
      styles={(theme) => ({
        root: {
          position: "absolute",
          opacity: !isOnline || reConnected ? 1 : 0,
          top: "0px",
          left: "0px",
          zIndex: !isOnline || reConnected ? 101 : -1,
          width: "100%",
          height: "60px",
          backgroundColor: !isOnline
            ? theme.colors.red[8]
            : theme.colors.green[8],
          borderRadius: 0,
        },
      })}
    />
  );
}
