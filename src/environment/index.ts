export function getBaseURL(): string {
  return import.meta.env.NODE_ENV === "production"
    ? "https://money-trace.onrender.com"
    : import.meta.env.VITE_API?.toString() ?? "";
}
