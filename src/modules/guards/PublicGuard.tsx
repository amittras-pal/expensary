import { Navigate, useLocation } from "react-router-dom";
import {
  getStoredActiveAccountId,
  getStoredDeviceAccounts,
  isLoggedIn,
} from "../../utils";

export default function PublicGuard({ children }: GuardProps) {
  const { search } = useLocation();
  const addAccountMode = new URLSearchParams(search).get("add") === "1";

  const authenticated = isLoggedIn();
  const hasActiveAccount = Boolean(getStoredActiveAccountId());
  const hasAnyKnownAccount = getStoredDeviceAccounts().length > 0;

  const shouldAllowLoginPage =
    addAccountMode || !hasActiveAccount || !hasAnyKnownAccount;

  return authenticated && !shouldAllowLoginPage ? (
    <Navigate to="/home" replace />
  ) : (
    children
  );
}
