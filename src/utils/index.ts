import { MantineColor } from "@mantine/core";

export function getAuthToken() {
  return localStorage.getItem("authToken");
}

const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
});

export function formatCurrency(amount: number) {
  return formatter.format(amount);
}

export function getPercentage(amount: number, total: number): number {
  return parseInt(((amount / total) * 100).toFixed(0));
}

export function getSeverityColor(amount: number, total: number): MantineColor {
  const perc = getPercentage(amount, total);
  if (perc <= 45) return "green";
  else if (perc > 45 && perc <= 70) return "yellow";
  else if (perc > 70 && perc <= 90) return "orange";
  else return "red";
}
