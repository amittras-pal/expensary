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
import { useQuery } from "@tanstack/react-query";
import OverlayLoader from "../components/loaders/OverlayLoader";
import { _20Min } from "../constants/app";
import { AUTH_STORAGE_KEYS } from "../constants/auth";
import { useErrorHandler } from "../hooks/error-handler";
import { getUserData } from "../services/user.service";
import { isLoggedIn } from "../utils";

type UserCtx = {
  userData: IUser | null;
  setUserData: Dispatch<SetStateAction<IUser | null>>;
  accounts: IDeviceAccount[];
  activeAccountId: string | null;
  setActiveAccount: (accountId: string | null) => void;
  applyUserSession: (user: IUser) => void;
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

  const setLegacyAuthFlag = useCallback((authenticated: boolean) => {
    if (authenticated)
      localStorage.setItem(AUTH_STORAGE_KEYS.legacyAuthenticated, "true");
    else localStorage.removeItem(AUTH_STORAGE_KEYS.legacyAuthenticated);

    window.dispatchEvent(new Event("storage"));
  }, []);

  const upsertAccount = useCallback(
    (user: IUser) => {
      const accountId = user._id;
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
      setActiveAccountId(accountId);
      setLegacyAuthFlag(Boolean(accountId));
    },
    [setActiveAccountId, setLegacyAuthFlag],
  );

  const applyUserSession = useCallback(
    (user: IUser) => {
      setUserData(user);
      setPrimaryColor(user.color);
      upsertAccount(user);
      setActiveAccount(user._id ?? null);
    },
    [setPrimaryColor, upsertAccount, setActiveAccount],
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
    // Reconcile stale local state: no saved account means no active account.
    if (accounts.length === 0 && activeAccountId) {
      setActiveAccount(null);
    }
  }, [accounts.length, activeAccountId, setActiveAccount]);

  useEffect(() => {
    if (activeAccountId === null) {
      localStorage.removeItem(AUTH_STORAGE_KEYS.activeAccountId);
    }
  }, [activeAccountId]);

  useEffect(() => {
    if (userData?._id) {
      upsertAccount(userData);
    }
  }, [upsertAccount, userData]);

  const shouldFetchCurrentUser =
    Boolean(activeAccountId) || Boolean(isLoggedIn());

  const { isFetching: loadingUser } = useQuery({
    queryKey: ["user-info", activeAccountId],
    enabled: shouldFetchCurrentUser,
    staleTime: _20Min,
    queryFn: getUserData,
    onError: (err) => {
      setUserData(null);
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
