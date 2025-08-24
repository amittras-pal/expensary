import { MantineColor } from "@mantine/core";
import dayjs from "dayjs";

export function getAuthToken() {
  return localStorage.getItem("isAuthenticated");
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
  return parseInt(((amount / total) * 100).toFixed(0));
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
