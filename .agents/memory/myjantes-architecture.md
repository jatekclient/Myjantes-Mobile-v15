---
name: MyJantes app architecture constraint
description: The mobile app is a pure frontend — no local storage, no client-side business logic. All data flows through the backend API.
---

# MyJantes — Architecture Rule: Pure Frontend

## The rule
The mobile app (Expo) is a **pure frontend**. It stores no business data locally and performs no business logic internally. Every piece of data — quotes, invoices, BL, balance, discount, contacts, statuses, company info — must come from a backend API call.

**Why:** The owner explicitly stated this as a non-negotiable constraint. The app serves as a display and interaction layer only; the backend owns all state and computation.

## How to apply
- **Every new feature starts with its backend endpoint**, then the UI consumes it.
- If an endpoint is missing on the upstream, the API server creates a proxy route that returns a structured empty/null response — never skip the backend.
- If an endpoint returns an error or is unreachable, the UI shows an explicit error state ("Données indisponibles — veuillez réessayer"). No silent fallbacks, no cached values, no locally computed defaults.
- No direct calls from the app to third-party APIs (no Expo Push, no Gouv SIRET API, etc.) — all such calls go through the backend.
- `AsyncStorage` / local storage is allowed only for session tokens and UI preferences (theme, biometrics toggle) — never for business data.
