import { Platform, Alert } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import { getApiAccessToken, getSessionCookie, refreshApiTokens } from "./api";
import { getMobileApiUrl } from "./config";

const getDIRECT_API = () => getMobileApiUrl();
const PDF_TIMEOUT_MS = 30_000;

function buildAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { Accept: "application/pdf" };
  const token = getApiAccessToken();
  const cookie = getSessionCookie();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  else if (cookie) headers["Cookie"] = cookie;
  return headers;
}

/** fetch avec timeout — évite un bouton "Chargement…" bloqué indéfiniment. */
async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PDF_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Build a public view URL for a PDF document if the server provides a viewToken.
 * The token comes from the quote/invoice detail payload.
 */
function buildPublicPdfUrl(
  type: "quotes" | "invoices",
  id: string,
  viewToken: string
): string {
  return `${getDIRECT_API()}/api/mobile/${type}/${id}/pdf?token=${encodeURIComponent(viewToken)}`;
}

export async function viewPdf(
  type: "quotes" | "invoices",
  id: string,
  fileName: string = "document.pdf",
  viewToken?: string | null,
): Promise<boolean> {
  try {
    // ── Public view URL (if server returned a viewToken) ─────────────────────
    if (viewToken) {
      const publicUrl = buildPublicPdfUrl(type, id, viewToken);

      if (Platform.OS === "web") {
        window.open(publicUrl, "_blank");
        return true;
      }

      try {
        await WebBrowser.openBrowserAsync(publicUrl);
        return true;
      } catch {
        // fall through to authenticated download
      }
    }

    // ── Authenticated fetch ──────────────────────────────────────────────────
    const directUrl = `${getDIRECT_API()}/api/mobile/${type}/${id}/pdf`;

    if (Platform.OS === "web") {
      try {
        let response = await fetchWithTimeout(directUrl, {
          method: "GET",
          headers: buildAuthHeaders(),
          credentials: "include",
        });

        // Jeton expiré : tenter un renouvellement puis rejouer une seule fois.
        if (response.status === 401 && (await refreshApiTokens())) {
          response = await fetchWithTimeout(directUrl, {
            method: "GET",
            headers: buildAuthHeaders(),
            credentials: "include",
          });
        }

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Session expirée. Veuillez vous reconnecter."
              : `Le serveur a répondu ${response.status}. Réessayez plus tard.`
          );
        }

        const blob = await response.blob();
        if (!blob || blob.size === 0) {
          throw new Error("PDF vide reçu");
        }

        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30_000);
        return true;
      } catch (err: any) {
        console.error("[PDF-VIEW-WEB] Error:", err);
        Alert.alert("Erreur", err?.message || "Impossible d'ouvrir le PDF.", [{ text: "OK" }]);
        return false;
      }
    }

    // ── Native download + share ──────────────────────────────────────────────
    try {
      const safeFileName = fileName.replace(/[^a-z0-9._-]/gi, "_");
      const filePath = `${FileSystem.documentDirectory}${safeFileName}`;

      let result = await FileSystem.downloadAsync(directUrl, filePath, { headers: buildAuthHeaders() });

      // Jeton expiré : renouveler puis retélécharger une seule fois.
      if (result.status === 401 && (await refreshApiTokens())) {
        result = await FileSystem.downloadAsync(directUrl, filePath, { headers: buildAuthHeaders() });
      }

      if (result.status !== 200) {
        throw new Error(
          result.status === 401
            ? "Session expirée. Veuillez vous reconnecter."
            : `Le serveur a répondu ${result.status}. Réessayez plus tard.`
        );
      }

      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists || !fileInfo.size || fileInfo.size === 0) {
        throw new Error("PDF vide reçu");
      }

      await Sharing.shareAsync(result.uri, {
        mimeType: "application/pdf",
        dialogTitle: safeFileName,
      });

      return true;
    } catch (err: any) {
      console.error("[PDF-VIEW-MOBILE] Error:", err);
      Alert.alert("Erreur", err?.message || "Impossible d'ouvrir le PDF.", [{ text: "OK" }]);
      return false;
    }
  } catch (err: any) {
    console.error("[PDF-VIEW] Error:", err);
    Alert.alert("Erreur", err?.message || "Impossible d'ouvrir le PDF.", [{ text: "OK" }]);
    return false;
  }
}
