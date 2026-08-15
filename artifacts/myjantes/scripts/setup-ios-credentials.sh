#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
#  ONE-TIME iOS credential setup for TestFlight / App Store builds
#
#  Run this ONCE in the Replit Shell (NOT as a workflow):
#    bash scripts/setup-ios-credentials.sh
#
#  Requirements: EXPO_TOKEN, APPLE_P8_FILE, APPLE_KEY_ID, ISSUER_APPLE_ID
#  must be set as Replit Secrets.
#
#  What it does:
#   1. Writes your .p8 key to a temp file
#   2. Opens the EAS credentials interactive menu
#      (NO Apple ID / NO 2FA — the ASC key handles Apple auth)
#   3. Follow the prompts: choose iOS > App Store distribution >
#      let EAS generate a Distribution Certificate + Provisioning Profile
#   4. After completion, the "Build iOS (App Store)" workflow works
#      fully automatically forever.
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "================================================"
echo "  iOS Credential Setup (one-time)"
echo "================================================"

# Check required secrets
for VAR in EXPO_TOKEN APPLE_P8_FILE APPLE_KEY_ID ISSUER_APPLE_ID; do
  if [ -z "${!VAR}" ]; then
    echo "ERROR: $VAR secret is not set. Add it via the Secrets panel and retry."
    exit 1
  fi
done

# Write .p8 to temp file
ASC_KEY_TMP="/tmp/AuthKey_${APPLE_KEY_ID}.p8"
printf '%s' "$APPLE_P8_FILE" > "$ASC_KEY_TMP"
chmod 600 "$ASC_KEY_TMP"

echo
echo "  ASC key written to: $ASC_KEY_TMP"
echo "  Key ID    : $APPLE_KEY_ID"
echo "  Issuer ID : $ISSUER_APPLE_ID"
echo "  Team ID   : GP593F562X"
echo
echo "  EAS will use this key to talk to Apple — NO Apple ID / NO 2FA."
echo
echo "  In the menu:"
echo "    1. Select platform : ios"
echo "    2. Select build profile : production"
echo "    3. Distribution Certificate : let EAS generate one"
echo "    4. Provisioning Profile     : let EAS generate one"
echo
echo "  Starting interactive credential setup..."
echo "================================================"
echo

export EXPO_TOKEN="$EXPO_TOKEN"
export EXPO_APPLE_TEAM_ID="GP593F562X"
export EXPO_ASC_KEY_ID="$APPLE_KEY_ID"
export EXPO_ASC_ISSUER_ID="$ISSUER_APPLE_ID"
export EXPO_ASC_API_KEY_PATH="$ASC_KEY_TMP"

npx --yes eas-cli@latest credentials:configure-build \
  --platform ios \
  --profile production

# Clean up
rm -f "$ASC_KEY_TMP"

echo
echo "================================================"
echo "  Done! iOS credentials are now stored in EAS."
echo "  You can now run the 'Build iOS (App Store)'"
echo "  workflow — it will work automatically."
echo "================================================"
