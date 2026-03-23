import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocalStorage } from "@mantine/hooks";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import OverlayLoader from "../components/loaders/OverlayLoader";
import { _20Min } from "../constants/app";
import { AUTH_ERROR_CODES } from "../constants/auth";
import { AUTH_STORAGE_KEYS } from "../constants/auth";
import { useErrorHandler } from "../hooks/error-handler";
import { getUserData } from "../services/user.service";

type UserCtx = {
  userData: IUser | null;
  setUserData: Dispatch<SetStateAction<IUser | null>>;
  accounts: IDeviceAccount[];
  activeAccountId: string | null;
  setActiveAccount: (accountId: string | null) => void;
  applyUserSession: (user: IUser, accountIdHint?: string | null) => void;
  removeAccountFromDevice: (accountId: string) => void;
  clearAccountRegistry: () => void;
};

const UserContext = createContext<UserCtx>({
  userData: null,
  setUserData: () => null,
  accounts: [],
  activeAccountId: null,
  setActiveAccount: () => null,
  applyUserSession: () => null,
  removeAccountFromDevice: () => null,
  clearAccountRegistry: () => null,
});

export const useCurrentUser = () => useContext(UserContext);

function getInitials(userName: string): string {
  const nameParts = userName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);

  const first = nameParts[0] ?? "";
  const last = nameParts[nameParts.length - 1] ?? "";

  const initials = [first[0], last[0]]
    .filter(Boolean)
    .map((value) => value.toUpperCase())
    .join("");

  return initials || "U";
}

export default function UserProvider({
  children,
}: Readonly<PropsWithChildren>) {
  const [userData, setUserData] = useState<IUser | null>(null);
  const queryClient = useQueryClient();

  const [accounts, setAccounts] = useLocalStorage<IDeviceAccount[]>({
    key: AUTH_STORAGE_KEYS.deviceAccounts,
    defaultValue: [],
  });
  const [activeAccountId, setActiveAccountId] = useLocalStorage<string | null>({
    key: AUTH_STORAGE_KEYS.activeAccountId,
    defaultValue: null,
  });

  const { onError } = useErrorHandler();

  const [, setPrimaryColor] = useLocalStorage({ key: "primary-color" });

  const upsertAccount = useCallback(
    (user: IUser, targetAccountId?: string) => {
      const accountId = targetAccountId ?? user._id;
      if (!accountId) return;

      const nextAccount: IDeviceAccount = {
        accountId,
        userName: user.userName,
        email: user.email,
        initials: getInitials(user.userName),
        color: user.color,
        lastUsedAt: new Date().toISOString(),
      };

      setAccounts((prev) => {
        const existingIndex = prev.findIndex(
          (account) => account.accountId === accountId,
        );
        if (existingIndex === -1) return [nextAccount, ...prev];

        const updated = [...prev];
        updated[existingIndex] = nextAccount;
        return updated;
      });
    },
    [setAccounts],
  );

  const setActiveAccount = useCallback(
    (accountId: string | null) => {
      const accountChanged = accountId !== activeAccountId;

      if (accountId) {
        localStorage.setItem(
          AUTH_STORAGE_KEYS.activeAccountId,
          JSON.stringify(accountId),
        );
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEYS.activeAccountId);
      }

      if (accountChanged) {
        queryClient.clear();
      }

      setActiveAccountId(accountId);
    },
    [activeAccountId, queryClient, setActiveAccountId],
  );

  const applyUserSession = useCallback(
    (user: IUser, accountIdHint?: string | null) => {
      const resolvedAccountId =
        accountIdHint ??
        user._id ??
        accounts.find(
          (account) =>
            account.email.trim().toLowerCase() ===
            user.email.trim().toLowerCase(),
        )?.accountId ??
        activeAccountId ??
        null;

      setUserData(user);
      setPrimaryColor(user.color);
      if (resolvedAccountId) {
        upsertAccount(user, resolvedAccountId);
      }
      setActiveAccount(resolvedAccountId);
    },
    [accounts, activeAccountId, setPrimaryColor, upsertAccount, setActiveAccount],
  );

  const removeAccountFromDevice = useCallback(
    (accountId: string) => {
      setAccounts((prev) =>
        prev.filter((account) => account.accountId !== accountId),
      );

      if (activeAccountId === accountId) {
        setUserData(null);
        setActiveAccount(null);
      }
    },
    [activeAccountId, setAccounts, setActiveAccount],
  );

  const clearAccountRegistry = useCallback(() => {
    setAccounts([]);
    setUserData(null);
    setActiveAccount(null);
  }, [setAccounts, setActiveAccount]);

  useEffect(() => {
    if (userData?._id) {
      upsertAccount(userData, userData._id ?? activeAccountId ?? undefined);
    }
  }, [activeAccountId, upsertAccount, userData]);

  const shouldFetchCurrentUser = Boolean(activeAccountId);

  const { isFetching: loadingUser } = useQuery({
    queryKey: ["user-info"],
    enabled: shouldFetchCurrentUser,
    staleTime: _20Min,
    queryFn: getUserData,
    onError: (err) => {
      const recoverableAuthCodes = new Set<string>([
        AUTH_ERROR_CODES.reauthRequired,
        AUTH_ERROR_CODES.activeSessionExpired,
        AUTH_ERROR_CODES.noActiveSession,
      ]);

      if (axios.isAxiosError(err)) {
        const code = (err.response?.data as { code?: string } | undefined)
          ?.code;
        const recoverableAuthError =
          err.response?.status === 401 &&
          typeof code === "string" &&
          recoverableAuthCodes.has(code);

        // Keep current user/account context for recoverable auth flows
        // (account switch + in-app re-auth modal).
        if (!recoverableAuthError) {
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      onError(err);
    },
    retry: 0,
    onSuccess: (res) => {
      applyUserSession(res.response);
    },
  });

  const ctx: UserCtx = useMemo(
    () => ({
      userData,
      setUserData,
      accounts,
      activeAccountId,
      setActiveAccount,
      applyUserSession,
      removeAccountFromDevice,
      clearAccountRegistry,
    }),
    [
      activeAccountId,
      accounts,
      applyUserSession,
      clearAccountRegistry,
      removeAccountFromDevice,
      setActiveAccount,
      userData,
    ],
  );

  return (
    <UserContext.Provider value={ctx}>
      {loadingUser ? <OverlayLoader visible /> : children}
    </UserContext.Provider>
  );
}
