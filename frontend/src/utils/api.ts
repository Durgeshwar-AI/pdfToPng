const DEFAULT_API_URL = "http://localhost:5000";

export function buildApiUrl(
  path: string,
  baseUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL,
) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}
