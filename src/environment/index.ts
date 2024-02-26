export function getBaseURL(): string {
  console.log(import.meta.env);

  return import.meta.env.DEV
    ? import.meta.env.VITE_API?.toString() ?? ""
    : "https://money-trace.onrender.com";
}
