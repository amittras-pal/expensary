import { MantineColor } from "@mantine/core";
import dayjs from "dayjs";
import { AUTH_STORAGE_KEYS } from "../constants/auth";
import { ResponseBody } from "../services/response.type";

function parseStoredValue<T>(raw: string | null): T | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return raw as unknown as T;
  }
}

export function isLoggedIn() {
  const activeAccountId = getStoredActiveAccountId();
  if (!activeAccountId) return false;

  return getStoredDeviceAccounts().some(
    (account) => account.accountId === activeAccountId
  );
}

export function getStoredActiveAccountId() {
  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.activeAccountId);
  const parsed = parseStoredValue<string | null>(raw);

  if (!parsed || parsed === "null" || parsed === "undefined") {
    return null;
  }

  return parsed;
}

export function getStoredDeviceAccounts(): IDeviceAccount[] {
  const raw = localStorage.getItem(AUTH_STORAGE_KEYS.deviceAccounts);
  if (!raw) return [];

  const parsed = parseStoredValue<IDeviceAccount[] | null>(raw);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter(
    (account) => Boolean(account?.accountId) && Boolean(account?.email)
  );
}

const currencyFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

const numAbbrFormat = new Intl.NumberFormat("en-IN", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export function formatCurrency(amount: number = 0) {
  return currencyFormat.format(amount);
}

export function abbreviateNumber(value: number) {
  return numAbbrFormat.format(value);
}

export function dateFormatter({ value }: { value: string }) {
  return dayjs(value).format("DD MMM, hh:mm a");
}

export function getPercentage(amount: number = 0, total: number = 0): number {
  return Number.parseInt(((amount / total) * 100).toFixed(0));
}

export function roundOff(num: number) {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

export function getSeverityColor(
  amount: number = 0,
  total: number = 0
): MantineColor {
  const perc = getPercentage(amount, total);
  if (perc <= 45) return "green";
  else if (perc > 45 && perc <= 70) return "yellow";
  else if (perc > 70 && perc <= 90) return "orange";
  else return "red";
}

export function downloadFile(dataBlob: Blob, fileName: string) {
  const href = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = href;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(href);
}

// Replace `Math.random()`
export const randomNumber = () => {
  const random = window.crypto.getRandomValues(new Uint8Array(1));
  return random[0] / Math.pow(2, 8);
};

export function groupCategories(
  categoryRes: ResponseBody<ICategory[]>
): SelectOptionsGrouped {
  const groups: Record<
    string,
    { group: string; items: { value: string; label: string; meta: string }[] }
  > = {};

  (categoryRes?.response ?? []).forEach((category) => {
    const grp = category.group || "Other";
    if (!groups[grp]) groups[grp] = { group: grp, items: [] };
    groups[grp].items.push({
      value: category._id ?? "",
      label: category.label,
      meta: `${category.icon}::${category.color}`,
    });
  });
  return Object.values(groups).sort((a, b) => a.group.localeCompare(b.group));
}
