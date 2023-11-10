import { MantineColor } from "@mantine/core";
import dayjs from "dayjs";

export function getAuthToken() {
  return localStorage.getItem("authToken");
}

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

export function formatCurrency(amount: number = 0) {
  return formatter.format(amount);
}

export function dateFormatter({ value }: { value: string }) {
  return dayjs(value).format("DD MMM, hh:mm a");
}

export function getPercentage(amount: number = 0, total: number = 0): number {
  return parseInt(((amount / total) * 100).toFixed(0));
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
