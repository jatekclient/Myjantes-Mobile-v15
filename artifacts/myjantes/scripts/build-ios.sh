#!/bin/bash
set -e

echo "================================================"
echo "  Build iOS (EAS)"
echo "================================================"

if [ -z "$EXPO_TOKEN" ]; then
  echo "ERROR: EXPO_TOKEN secret is missing."
  echo "Add it via the Secrets panel and retry."
  exit 1
fi

PROFILE="${EAS_PROFILE:-preview}"
PLATFORM="ios"

echo "Profile : $PROFILE"
echo "Platform: $PLATFORM"
echo "Owner   : mytoolsgroup"
echo

case "$PROFILE" in
  preview|development)
    echo "Note: '$PROFILE' produces an iOS Simulator build (.app, no signing)."
    echo "      To build a signed IPA for TestFlight / App Store, run:"
    echo "        EAS_PROFILE=production bash scripts/build-ios.sh"
    ;;
  production)
    echo "Note: 'production' profile builds a signed IPA for TestFlight / App Store."
    ;;
  *)
    echo "Note: using custom profile '$PROFILE'."
    ;;
esac
echo

# ── Clean potentially corrupted npx cache ─────────────────────────────────
rm -rf ~/.npm/_npx/ 2>/dev/null || true

# ── ASC API key (no Apple 2FA required) ────────────────────────────────────
# Secrets: APPLE_P8_FILE, APPLE_KEY_ID, ISSUER_APPLE_ID
# EAS uses these to auto-create/renew Distribution Certificate and
# Provisioning Profile without any interactive Apple login.
ASC_KEY_TMP=""
if [ -n "$APPLE_P8_FILE" ] && [ -n "$APPLE_KEY_ID" ] && [ -n "$ISSUER_APPLE_ID" ]; then
  ASC_KEY_TMP="/tmp/AuthKey_${APPLE_KEY_ID}.p8"
  printf '%s' "$APPLE_P8_FILE" > "$ASC_KEY_TMP"
  export EXPO_ASC_KEY_ID="$APPLE_KEY_ID"
  export EXPO_ASC_ISSUER_ID="$ISSUER_APPLE_ID"
  export EXPO_ASC_API_KEY_PATH="$ASC_KEY_TMP"
  export EXPO_APPLE_TEAM_ID="${APPLE_TEAM_ID:-GP593F562X}"
  echo "[ASC] App Store Connect API key configured — no Apple 2FA required."
else
  echo "[ASC] APPLE_P8_FILE / APPLE_KEY_ID / ISSUER_APPLE_ID not set."
  echo "      EAS will use remotely stored credentials (if already provisioned)."
  echo "      If this is a first-time build, credentials setup is required."
  echo "      See README or run interactively in the Shell:"
  echo "        EXPO_TOKEN=\$EXPO_TOKEN npx eas-cli@latest credentials --platform ios"
fi
echo

echo "[1/3] Verifying EAS authentication..."
EXPO_TOKEN="$EXPO_TOKEN" npx --yes eas-cli@latest whoami

echo
echo "[2/3] Submitting build to EAS (non-interactive, --no-wait)..."
echo "      The build runs on Expo's servers; this command exits as soon as"
echo "      the job is queued. Track progress at the URL printed below."
echo

EXPO_TOKEN="$EXPO_TOKEN" npx --yes eas-cli@latest build \
  --platform "$PLATFORM" \
  --profile "$PROFILE" \
  --non-interactive \
  --no-wait

# Clean up temp key file
if [ -n "$ASC_KEY_TMP" ] && [ -f "$ASC_KEY_TMP" ]; then
  rm -f "$ASC_KEY_TMP"
fi

echo
echo "[3/3] Build queued."
echo "View status: https://expo.dev/accounts/mytoolsgroup/projects/mytoolsapp/builds"

if [ "$PROFILE" = "production" ]; then
  echo
  echo "After the build completes, submit to TestFlight / App Store Connect with:"
  echo "  SUBMIT_PLATFORM=ios bash scripts/submit-stores.sh"
fi
