export function getBaseURL(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL?.toString();
  return baseUrl ? `${baseUrl}/api` : "";
}
