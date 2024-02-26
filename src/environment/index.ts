export function getBaseURL(): string {
  return import.meta.env.VITE_API_BASE_URL?.toString() ?? "";
}
