const rawApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

if (!rawApiBaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_API_URL in the frontend environment.");
}

export const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, "");

export function apiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
