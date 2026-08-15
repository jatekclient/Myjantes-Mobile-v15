import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import healthRouter from "./routes/health";
import mobileStorageRouter from "./routes/mobile-storage";
import { registerRoutes } from "./routes/routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());

// Preserve multipart bodies for Busboy and upstream forwarding. Express's JSON
// parser intentionally ignores multipart requests, but without this capture
// the upload routes receive an empty body.
app.use((req, res, next) => {
  const contentType = String(req.headers["content-type"] || "").toLowerCase();
  if (!contentType.includes("multipart/form-data")) return next();

  const MAX_MULTIPART_BYTES = 25 * 1024 * 1024;
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  let finished = false;

  req.on("data", (chunk: Buffer | string) => {
    if (finished) return;
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > MAX_MULTIPART_BYTES) {
      finished = true;
      res.status(413).json({ message: "Fichier trop volumineux. Limite: 25 Mo." });
      req.removeAllListeners("data");
      req.removeAllListeners("end");
      req.resume();
      return;
    }
    chunks.push(buffer);
  });

  req.on("end", () => {
    if (finished) return;
    (req as any).rawBody = Buffer.concat(chunks);
    next();
  });
  req.on("error", next);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.use("/api", healthRouter);

// Mobile storage — presigned GCS URLs for Expo app photo uploads
app.use("/api", mobileStorageRouter);

// Mount legacy proxy routes directly on app (they self-prefix with /api/...)
registerRoutes(app).catch((err) => {
  logger.error({ err }, "Failed to register routes");
});

export default app;
