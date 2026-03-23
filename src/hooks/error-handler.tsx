import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import axios, { AxiosError } from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_ERROR_CODES, AUTH_EVENTS } from "../constants/auth";
import { getStoredActiveAccountId, getStoredDeviceAccounts } from "../utils";

export function useErrorHandler(func?: () => void) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onError = (err: unknown) => {
    if (axios.isAxiosError(err)) {
      const axiosError = err as AxiosError;
      const payload = (axiosError.response?.data ?? {}) as {
        message?: string;
        code?: string;
        response?: { accountId?: string };
      };
      const message = payload.message || "Unknown error occurred";

      if (axiosError.response?.status === 401 && pathname !== "/login") {
        const accountId = payload.response?.accountId || getStoredActiveAccountId();
        const knownAccountIds = new Set(
          getStoredDeviceAccounts().map((account) => account.accountId),
        );
        const authCode = payload.code;
        const reauthCodes = new Set<string>([
          AUTH_ERROR_CODES.reauthRequired,
          AUTH_ERROR_CODES.activeSessionExpired,
          AUTH_ERROR_CODES.noActiveSession,
        ]);

        if (
          accountId &&
          authCode &&
          reauthCodes.has(authCode) &&
          knownAccountIds.has(accountId)
        ) {
          notifications.hide("invalid_session");
          notifications.show({
            id: "invalid_session",
            title: "Session verification required",
            message,
            color: "red",
            icon: <IconX />,
          });

          globalThis.dispatchEvent(
            new CustomEvent(AUTH_EVENTS.reauthRequired, {
              detail: { accountId, reason: authCode },
            }),
          );

          func?.();
          return;
        }

        if (!knownAccountIds.size) {
          notifications.show({
            id: "invalid_session",
            title: "Login required",
            message: "No saved account found on this device. Please log in.",
            color: "red",
            icon: <IconX />,
          });
          navigate("/login");
          func?.();
          return;
        }

        notifications.show({
          id: "invalid_session",
          title: "Session Expired / Invalid Session",
          message,
          color: "red",
          icon: <IconX />,
        });

        if (!accountId) {
          navigate("/login");
        }
      } else {
        notifications.show({ message, color: "red", icon: <IconX /> });
      }
    }

    func?.();
  };

  return { onError };
}
