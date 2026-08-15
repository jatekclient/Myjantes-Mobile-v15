#!/bin/bash
set -e

echo "================================================"
echo "  Submit latest EAS build(s) to the stores"
echo "================================================"

if [ -z "$EXPO_TOKEN" ]; then
  echo "ERROR: EXPO_TOKEN secret is missing."
  exit 1
fi

PLATFORM="${SUBMIT_PLATFORM:-all}"

echo "Platform: $PLATFORM"
echo "Owner   : mytoolsgroup"
echo

submit_android() {
  echo
  echo "------------------------------------------------"
  echo "  Submitting latest Android build to Play Store"
  echo "------------------------------------------------"
  if [ -z "$GOOGLE_SERVICE_ACCOUNT_KEY" ] || [ ! -f "$GOOGLE_SERVICE_ACCOUNT_KEY" ]; then
    echo "WARNING: GOOGLE_SERVICE_ACCOUNT_KEY is not set or the file does not"
    echo "         exist. The Play Console service-account JSON path is required"
    echo "         (see eas.json -> submit.production.android.serviceAccountKeyPath)."
    echo "         The submission will likely fail; continuing anyway so EAS can"
    echo "         report the precise error."
  fi

  EXPO_TOKEN="$EXPO_TOKEN" npx --yes eas-cli@latest submit \
    --platform android \
    --latest \
    --non-interactive \
    --no-wait || {
      echo "Android submission failed. Common causes:"
      echo "  • The latest Android build is an APK (preview profile) — Play Store"
      echo "    requires an AAB. Re-run with EAS_PROFILE=production scripts/build-android.sh"
      echo "  • Service-account JSON missing or lacks Play Console permissions."
      return 1
    }
}

submit_ios() {
  echo
  echo "------------------------------------------------"
  echo "  Submitting latest iOS build to App Store Connect"
  echo "------------------------------------------------"

  if [ -z "$APPLE_P8_FILE" ] || [ -z "$APPLE_KEY_ID" ] || [ -z "$ISSUER_APPLE_ID" ]; then
    echo "ERROR: APPLE_P8_FILE, APPLE_KEY_ID or ISSUER_APPLE_ID secret is missing."
    return 1
  fi

  # 1. Write ASC API key P8 to a fixed temp path — proper PEM normalization via Node
  local P8_PATH="/tmp/AuthKey_submit.p8"
  APPLE_P8_FILE="$APPLE_P8_FILE" node -e "
    const fs = require('fs');
    const raw = process.env.APPLE_P8_FILE || '';
    // Identical normalizeP8 logic from create-ios-creds.js
    let s = raw.replace(/\\\\n/g, '\\n');
    const hasHeader = s.includes('-----BEGIN');
    if (!hasHeader) {
      s = s.replace(/\\s+/g, '');
      const wrapped = s.match(/.{1,64}/g).join('\\n');
      s = '-----BEGIN PRIVATE KEY-----\\n' + wrapped + '\\n-----END PRIVATE KEY-----\\n';
    } else if (!s.includes('\\n')) {
      // Single-line with spaces: split on -----BEGIN... and -----END...
      const m = s.match(/(-----BEGIN[^-]*-----)(.*)(-----END[^-]*-----)/);
      if (m) {
        const b64 = m[2].replace(/\\s+/g, '').match(/.{1,64}/g).join('\\n');
        s = m[1] + '\\n' + b64 + '\\n' + m[3] + '\\n';
      } else {
        s = s.replace(/ /g, '\\n');
      }
    }
    if (!s.endsWith('\\n')) s += '\\n';
    fs.writeFileSync('$P8_PATH', s);
    console.log('P8 written (' + s.split('\\n').length + ' lines)');
  "

  if [ ! -s "$P8_PATH" ]; then
    echo "ERROR: Could not write ASC API key to temp file."
    return 1
  fi

  # 2. Patch eas.json submit section with ascApiKeyPath/Id/IssuerId using Node
  node - "$P8_PATH" "$APPLE_KEY_ID" "$ISSUER_APPLE_ID" <<'NODEJS'
const fs = require('fs');
const [,, p8Path, keyId, issuerId] = process.argv;
const easJson = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
// Backup original
fs.writeFileSync('eas.json.bak', JSON.stringify(easJson, null, 2));
// Patch submit.production.ios
easJson.submit = easJson.submit || {};
easJson.submit.production = easJson.submit.production || {};
easJson.submit.production.ios = easJson.submit.production.ios || {};
easJson.submit.production.ios.ascApiKeyPath = p8Path;
easJson.submit.production.ios.ascApiKeyId = keyId;
easJson.submit.production.ios.ascApiKeyIssuerId = issuerId;
fs.writeFileSync('eas.json', JSON.stringify(easJson, null, 2));
console.log('eas.json patched with ASC API key configuration.');
NODEJS

  # 3. Submit
  EXPO_TOKEN="$EXPO_TOKEN" npx --yes eas-cli@latest submit \
    --platform ios \
    --latest \
    --non-interactive \
    --no-wait
  local EXIT_CODE=$?

  # 4. Restore original eas.json
  if [ -f eas.json.bak ]; then
    mv eas.json.bak eas.json
  fi
  rm -f "$P8_PATH"

  if [ $EXIT_CODE -ne 0 ]; then
    echo "iOS submission failed. Check the EAS submission logs above."
    return 1
  fi
}

echo "[1/2] Verifying EAS authentication..."
rm -rf ~/.npm/_npx/ 2>/dev/null || true
EXPO_TOKEN="$EXPO_TOKEN" npx --yes eas-cli@latest whoami

echo
echo "[2/2] Submitting..."
case "$PLATFORM" in
  android) submit_android ;;
  ios)     submit_ios ;;
  all)
    submit_android || true
    submit_ios     || true
    ;;
  *)
    echo "ERROR: SUBMIT_PLATFORM must be one of: android, ios, all (got: $PLATFORM)"
    exit 1
    ;;
esac

echo
echo "Done. Track submission status at:"
echo "  https://expo.dev/accounts/mytoolsgroup/projects/mytoolsapp/submissions"
