---
name: MyJantes Expo port lessons
description: Key pitfalls and lessons from the MyJantes Expo app in the multi-artifact workspace.
---

## Metro blockList for server-only packages

When server-side packages like `@google-cloud/storage` and `google-auth-library` are installed anywhere in the pnpm workspace, Metro (the Expo bundler) tries to watch their directories — including temporary build dirs that get deleted — causing a fatal ENOENT crash.

**Fix:** Add them to Metro's `blockList` in `artifacts/myjantes/metro.config.js`:
```js
config.resolver.blockList = [
  /node_modules\/.pnpm\/@google-cloud\+storage.*/,
  /node_modules\/.pnpm\/google-auth-library.*/,
  // other GCP packages...
];
```

**Why:** pnpm hoists packages to the workspace root's node_modules; Metro watches all of them by default.

## api-server mobile-storage route

A presigned GCS upload URL endpoint lives at `POST /api/mobile-storage/request-url`. It is mounted in `artifacts/api-server/src/app.ts` (NOT in `routes/index.ts` which is not used by app.ts — app.ts imports `registerRoutes` from `routes/routes.ts` directly).

**How to apply:** When adding new routes to the Replit api-server, always mount them in `app.ts`.

## Theme color conventions

- Primary: rouge sang (#A30000 dark, #8B0000 light)
- Success/Accepted: bleu (#2563EB dark, #1D4ED8 light) — NOT green/turquoise
- Warning/Pending: gris clair (#9CA3AF) — NOT amber/yellow
- The DarkTheme is the primary design target (Cockpit-style dark UI)

## GCS photo upload flow (mobile → PWA)

1. Mobile calls `POST /api/mobile-storage/request-url` on the Replit api-server to get a presigned GCS URL
2. Mobile uploads photo blob directly to GCS via PUT (no binary through backend)
3. Mobile includes `photoUrls: [...]` array in the quote creation body sent to api.myjantes.fr
4. Fallback: if GCS fails, send FormData to api.myjantes.fr (existing behavior)

`STORAGE_API_BASE` in `artifacts/myjantes/lib/config.ts` uses `EXPO_PUBLIC_STORAGE_API_URL` env var (set it to deployed api-server URL for production).
