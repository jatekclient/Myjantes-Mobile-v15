/**
 * The mobile client has one and only one upstream for business data.
 *
 * Do not derive this from the Replit preview origin or from an environment
 * variable: doing so would make the installed app talk to a local proxy.
 */
export const MYJANTES_API_BASE = "https://api.myjantes.fr";

/**
 * Storage API — Replit api-server (GCS presigned URLs for direct photo upload).
 * Set EXPO_PUBLIC_STORAGE_API_URL to the deployed api-server URL in production.
 * In development, falls back to the Replit dev domain.
 */
export const STORAGE_API_BASE: string =
  (process.env.EXPO_PUBLIC_STORAGE_API_URL as string) ||
  `https://${process.env.EXPO_PUBLIC_DOMAIN || "cb3b9e17-8486-440e-a2bf-9af35bfccb6f-00-zkoubb9x77ta.kirk.replit.dev"}/api`;

export async function initApiConfig(): Promise<void> {
  // Intentionally a no-op. The API contract requires a fixed production host.
}

export function getMobileApiUrl(): string {
  return MYJANTES_API_BASE;
}

export const NATIVE_BACKEND_URLS = [MYJANTES_API_BASE] as const;

export function getNativeApiBase(): string {
  return MYJANTES_API_BASE;
}

export const EXTERNAL_API_PRIMARY = MYJANTES_API_BASE;
export const PUBLIC_BASE_URL = MYJANTES_API_BASE;
