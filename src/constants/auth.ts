export const AUTH_STORAGE_KEYS = Object.freeze({
  deviceAccounts: "deviceAccounts.v2",
  activeAccountId: "activeAccountId.v2",
});

export const AUTH_ERROR_CODES = Object.freeze({
  reauthRequired: "REAUTH_REQUIRED",
  noActiveSession: "NO_ACTIVE_SESSION",
  activeSessionExpired: "ACTIVE_SESSION_EXPIRED",
  maxDeviceAccountsReached: "MAX_DEVICE_ACCOUNTS_REACHED",
  invalidCredentials: "INVALID_CREDENTIALS",
});

export const AUTH_EVENTS = Object.freeze({
  reauthRequired: "expensary:auth:reauth-required",
});

export type LogoutScope = "current" | "all";
