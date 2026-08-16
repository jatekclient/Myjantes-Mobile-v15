---
name: MyJantes OTA (EAS Update)
description: Configuration OTA de l'app Expo MyJantes — canal preview, runtimeVersion, limite des APK antérieurs.
---

# OTA MyJantes

- expo-updates est configuré : `updates.url = https://u.expo.dev/<projectId>`, `runtimeVersion.policy = "appVersion"` (donc runtime = version app, ex. 2.15.8). Canaux définis dans eas.json : `preview` et `production`.
- Publier une mise à jour : `EXPO_TOKEN="$EXPO_TOKEN_SEC" npx eas-cli update --channel preview --message "..." --non-interactive` depuis `artifacts/myjantes`.
- **Why:** les APK compilés AVANT l'installation d'expo-updates (ex. build 85) ne reçoivent JAMAIS d'OTA — le module doit être dans le binaire. Un rebuild unique est requis après activation d'expo-updates ; ensuite tout correctif JS passe en OTA.
- **How to apply:** si `runtimeVersion.policy = appVersion`, changer la version de l'app dans app.json casse la compatibilité OTA avec les binaires existants — n'incrémenter la version que lors d'un rebuild.
- Push GitHub : header basic auth avec `x-access-token:$GITHUB_PAT` en base64 via `git -c http.extraheader=...`.
