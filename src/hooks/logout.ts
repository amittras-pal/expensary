import { useLocalStorage } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { primaryColor } from "../constants/app";
import {
  AUTH_ERROR_CODES,
  AUTH_EVENTS,
  LogoutScope,
} from "../constants/auth";
import { useCurrentUser } from "../context/user.context";
import { useErrorHandler } from "./error-handler";
import { logoutUser, switchActiveAccount } from "../services/user.service";

export const useLogoutHandler = () => {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [, setPrimaryColor] = useLocalStorage({ key: "primary-color" });
  const {
    accounts,
    activeAccountId,
    applyUserSession,
    removeAccountFromDevice,
    clearAccountRegistry,
  } = useCurrentUser();
  const { onError } = useErrorHandler();

  const completeLogout = () => {
    clearAccountRegistry();
    client.clear();
    navigate("/login");
    setPrimaryColor(primaryColor);
  };

  const fallbackToNextAccount = async (
    remainingAccountIds: string[] = [],
  ): Promise<void> => {
    const nextAccountId =
      remainingAccountIds[0] ||
      accounts.find((account) => account.accountId !== activeAccountId)
        ?.accountId;

    if (!nextAccountId) {
      completeLogout();
      return;
    }

    try {
      const switched = await switchActiveAccount({ accountId: nextAccountId });
      client.clear();
      applyUserSession(switched.response, nextAccountId);
      navigate("/home");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const payload = (err.response?.data ?? {}) as { code?: string };
        if (
          err.response?.status === 401 &&
          payload.code === AUTH_ERROR_CODES.reauthRequired
        ) {
          globalThis.dispatchEvent(
            new CustomEvent(AUTH_EVENTS.reauthRequired, {
              detail: { accountId: nextAccountId, reason: payload.code },
            }),
          );
          return;
        }
      }

      onError(err);
    }
  };

  const { mutate: triggerLogout, isLoading: loggingOut } = useMutation({
    mutationFn: logoutUser,
    onError,
    onSuccess: (res, scope) => {
      const targetScope = (scope as LogoutScope | undefined) ?? "current";

      if (targetScope === "all") {
        completeLogout();
        return;
      }

      if (activeAccountId) {
        removeAccountFromDevice(activeAccountId);
      }

      void fallbackToNextAccount(res.response?.remainingAccountIds);
    },
  });

  const logout = (scope: LogoutScope = "current") => triggerLogout(scope);
  const logoutAll = () => logout("all");

  return { logout, logoutAll, loggingOut };
};
