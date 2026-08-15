/**
 * Mobile Storage Routes — presigned GCS upload URLs for the Expo mobile app.
 * No session auth required: the presigned URL is time-limited (15min) and
 * the bucket is write-only from the client side.
 */
import { Router, type IRouter, type Request, type Response } from "express";
import { ObjectStorageService } from "../lib/objectStorage.js";
import { z } from "zod";

const router: IRouter = Router();
const storage = new ObjectStorageService();

const RequestBody = z.object({
  name: z.string().min(1),
  size: z.number().positive(),
  contentType: z.string().min(1),
});

/**
 * POST /mobile-storage/request-url
 * Returns a presigned PUT URL + objectPath for direct-to-GCS upload.
 * Called by the Expo app before uploading photos for devis.
 */
router.post("/mobile-storage/request-url", async (req: Request, res: Response) => {
  const parsed = RequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "name, size, contentType requis" });
    return;
  }

  try {
    const uploadURL = await storage.getObjectEntityUploadURL();
    const objectPath = storage.normalizeObjectEntityPath(uploadURL);
    const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_ENDPOINT || ""}${objectPath}`;
    res.json({ uploadURL, objectPath, publicUrl });
  } catch (err: any) {
    res.status(500).json({ error: "Impossible de générer l'URL d'upload", detail: err?.message });
  }
});

/**
 * GET /mobile-storage/objects/*objectPath
 * Serve a stored object (for PWA access).
 */
router.get("/mobile-storage/objects/*objectPath", async (req: Request, res: Response) => {
  const objectPath = `/objects/${(req.params as any).objectPath || ""}`;
  try {
    const file = await storage.getObjectEntityFile(objectPath);
    const response = await storage.downloadObject(file);
    res.setHeader("Content-Type", response.headers.get("Content-Type") || "application/octet-stream");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    const buf = Buffer.from(await response.arrayBuffer());
    res.send(buf);
  } catch (err: any) {
    if (err?.name === "ObjectNotFoundError") {
      res.status(404).json({ error: "Fichier introuvable" });
    } else {
      res.status(500).json({ error: "Erreur de lecture", detail: err?.message });
    }
  }
});

export default router;
