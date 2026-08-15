#!/usr/bin/env node
/**
 * Fully automated iOS credential creation — no interactive menu needed.
 *
 * What it does (all automated, no Apple ID / no 2FA):
 *   1. Generates a private key + CSR via openssl
 *   2. Creates an iOS Distribution Certificate via Apple API (ASC key auth)
 *   3. Finds/creates the bundle ID in Apple Developer
 *   4. Creates an App Store Provisioning Profile via Apple API
 *   5. Registers the Apple Team in EAS (if needed)
 *   6. Uploads the cert (P12) + profile to EAS
 *   7. Wires everything together → EAS build credentials ready
 *
 * Required Replit Secrets:
 *   EXPO_TOKEN      — EAS access token
 *   APPLE_KEY_ID    — App Store Connect API key ID
 *   ISSUER_APPLE_ID — App Store Connect issuer UUID
 *   APPLE_P8_FILE   — Content of the .p8 private key file
 */
'use strict';
const https  = require('https');
const crypto = require('crypto');
const fs     = require('fs');
const { execSync } = require('child_process');

// ── Constants ─────────────────────────────────────────────────────────────────
const BUNDLE_ID   = 'app.mytoolsmobile.mytoolsgroup.eu';
const TEAM_ID     = 'GP593F562X';
const TEAM_TYPE   = 'INDIVIDUAL';
const EAS_ACCOUNT = 'mytoolsapps';
const EAS_APP_SLUG = 'mytoolsapp';

// ── Utility ───────────────────────────────────────────────────────────────────
function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function derToP1363(der, coordLen) {
  // DER ECDSA: SEQUENCE { INTEGER r, INTEGER s }
  // P1363: r || s each padded to coordLen bytes (required for JWT ES256)
  let offset = 2; // skip SEQUENCE tag + length
  const rLen = der[offset + 1];
  const rStart = offset + 2;
  const r = der.slice(rStart + Math.max(0, rLen - coordLen), rStart + rLen);
  offset = rStart + rLen;
  const sLen = der[offset + 1];
  const sStart = offset + 2;
  const s = der.slice(sStart + Math.max(0, sLen - coordLen), sStart + sLen);
  const out = Buffer.alloc(coordLen * 2, 0);
  r.copy(out, coordLen - r.length);
  s.copy(out, coordLen * 2 - s.length);
  return out;
}

function normalizeP8(p8) {
  p8 = p8.trim();
  // Handle literal \n sequences
  if (!p8.includes('\n') && p8.includes('\\n')) {
    p8 = p8.replace(/\\n/g, '\n');
  }
  // If still no newlines, the secret was stored with spaces — reconstruct PEM
  if (!p8.includes('\n')) {
    // Extract everything between the PEM markers
    const match = p8.match(/-----BEGIN ([^-]+)-----\s*([\s\S]*?)\s*-----END ([^-]+)-----/);
    if (match) {
      const type = match[1];
      // Remove all whitespace from the base64 body, then re-wrap at 64 chars
      const b64 = match[2].replace(/\s+/g, '');
      const lines = b64.match(/.{1,64}/g) || [];
      p8 = `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`;
    }
  }
  return p8;
}

function makeAppleJwt(keyId, issuerId, p8Raw) {
  const p8 = normalizeP8(p8Raw);
  const hdr = b64url(JSON.stringify({ alg: 'ES256', kid: keyId, typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const pay = b64url(JSON.stringify({ iss: issuerId, aud: 'appstoreconnect-v1', iat: now, exp: now + 1100 }));
  const msg = `${hdr}.${pay}`;
  // Sign: get DER-encoded ECDSA signature, then convert to P1363 for JWT
  const derSig = crypto.createSign('SHA256').update(msg).sign(p8);
  const p1363  = derToP1363(derSig, 32);
  return `${msg}.${b64url(p1363)}`;
}

function req(opts, body) {
  return new Promise((res, rej) => {
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const r = https.request(opts, response => {
      let d = '';
      response.on('data', c => d += c);
      response.on('end', () => {
        try { res({ status: response.statusCode, body: JSON.parse(d) }); }
        catch { res({ status: response.statusCode, body: d }); }
      });
    });
    r.on('error', rej);
    if (payload) r.write(payload);
    r.end();
  });
}

function apple(method, path, jwt, body) {
  const payload = body ? JSON.stringify(body) : null;
  return req({
    hostname: 'api.appstoreconnect.apple.com', path: `/v1${path}`, method,
    headers: {
      Authorization: `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
    }
  }, payload);
}

function eas(query, variables = {}) {
  const payload = JSON.stringify({ query, variables });
  return req({
    hostname: 'api.expo.dev', path: '/graphql', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      Authorization: `Bearer ${process.env.EXPO_TOKEN}`,
      'expo-client-info': JSON.stringify({ appVersion: '7.0.0', clientType: 'EAS' })
    }
  }, payload);
}

function die(msg, details) {
  console.error(`\nERROR: ${msg}`);
  if (details) console.error(JSON.stringify(details, null, 2));
  process.exit(1);
}

function ok(label) { console.log(`      ✓  ${label}`); }

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  const { EXPO_TOKEN, APPLE_KEY_ID, ISSUER_APPLE_ID, APPLE_P8_FILE } = process.env;
  for (const k of ['EXPO_TOKEN', 'APPLE_KEY_ID', 'ISSUER_APPLE_ID', 'APPLE_P8_FILE']) {
    if (!process.env[k]) die(`${k} secret is not set. Add it via the Secrets panel.`);
  }

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  iOS Credential Automation for EAS       ║');
  console.log('╚══════════════════════════════════════════╝\n');

  // ── Step 1: Apple JWT ──────────────────────────────────────────────────────
  console.log('[1/8] Building Apple API JWT...');
  const jwt = makeAppleJwt(APPLE_KEY_ID, ISSUER_APPLE_ID, APPLE_P8_FILE);
  ok('JWT ready');

  // ── Step 2: Generate private key + CSR ────────────────────────────────────
  console.log('\n[2/8] Generating RSA private key + CSR...');
  const keyFile = '/tmp/ios_dist.key';
  const csrFile = '/tmp/ios_dist.csr';
  const cerFile = '/tmp/ios_dist.cer';
  const p12File = '/tmp/ios_dist.p12';
  execSync(
    `openssl req -newkey rsa:2048 -keyout ${keyFile} -noenc` +
    ` -out ${csrFile} -subj "/CN=iOS Distribution/OU=${TEAM_ID}/C=US"`,
    { stdio: 'pipe' }
  );
  const csrPem = fs.readFileSync(csrFile, 'utf8');
  const csrB64 = csrPem.replace(/-----[^-]+-----/g, '').replace(/\s/g, '');
  ok('Key + CSR generated');

  // ── Step 3: Create iOS Distribution Certificate via Apple API ─────────────
  console.log('\n[3/8] Creating iOS Distribution Certificate at Apple...');
  // Check for existing certificates first
  const existingCerts = await apple('GET',
    '/certificates?filter%5BcertificateType%5D=IOS_DISTRIBUTION&limit=10', jwt);
  if (existingCerts.body.data && existingCerts.body.data.length > 0) {
    console.log(`      Found ${existingCerts.body.data.length} existing certificate(s) — revoking...`);
    for (const c of existingCerts.body.data) {
      const del = await apple('DELETE', `/certificates/${c.id}`, jwt);
      if (del.status !== 204) {
        console.log(`      Warning: could not revoke ${c.id} (status ${del.status})`);
      } else {
        console.log(`      Revoked: ${c.id} (serial ${c.attributes?.serialNumber})`);
      }
    }
  }
  const certResp = await apple('POST', '/certificates', jwt, {
    data: {
      type: 'certificates',
      attributes: { certificateType: 'IOS_DISTRIBUTION', csrContent: csrB64 }
    }
  });
  if (certResp.status !== 201) die('Apple API rejected certificate creation', certResp.body);
  const appleCertId     = certResp.body.data.id;
  const appleCertSerial = certResp.body.data.attributes.serialNumber;
  const appleCertB64    = certResp.body.data.attributes.certificateContent;
  const appleCertExpiry = certResp.body.data.attributes.expirationDate;
  ok(`Serial ${appleCertSerial}  expires ${appleCertExpiry}`);

  // Convert Apple DER cert → PEM → P12 (3DES, password protected — required by EAS)
  const pemFile = '/tmp/ios_dist.pem';
  const P12_PASS = 'mytools_ios_2026';
  fs.writeFileSync(cerFile, Buffer.from(appleCertB64, 'base64'));
  execSync(`openssl x509 -inform DER -in ${cerFile} -out ${pemFile}`, { stdio: 'pipe' });
  execSync(
    `openssl pkcs12 -export -out ${p12File}` +
    ` -inkey ${keyFile} -in ${pemFile}` +
    ` -certpbe PBE-SHA1-3DES -keypbe PBE-SHA1-3DES -macalg SHA1` +
    ` -passout pass:${P12_PASS}`,
    { stdio: 'pipe' }
  );
  // Validate the P12 can be parsed back correctly before uploading
  const verifyOut = execSync(
    `openssl pkcs12 -in ${p12File} -passin pass:${P12_PASS} -noout 2>&1 || true`,
    { stdio: 'pipe' }
  ).toString().trim();
  if (verifyOut && !verifyOut.includes('MAC verified OK') && verifyOut.includes('Error')) {
    die(`P12 self-validation failed: ${verifyOut}`);
  }
  const p12B64 = fs.readFileSync(p12File).toString('base64');
  ok(`Converted to P12 (PBE-SHA1-3DES, SHA1 MAC)`);

  // ── Step 4: Find bundle ID in Apple Developer ─────────────────────────────
  console.log('\n[4/8] Looking up bundle ID in Apple Developer...');
  let appleBundleId = null;
  const bundleList = await apple('GET',
    `/bundleIds?filter%5Bidentifier%5D=${encodeURIComponent(BUNDLE_ID)}&filter%5Bplatform%5D=IOS`, jwt);
  if (bundleList.body.data && bundleList.body.data.length > 0) {
    appleBundleId = bundleList.body.data[0].id;
    ok(`Found existing: ${appleBundleId}`);
  } else {
    console.log('      Not found — creating...');
    const createB = await apple('POST', '/bundleIds', jwt, {
      data: {
        type: 'bundleIds',
        attributes: { identifier: BUNDLE_ID, name: 'MyTools Mobile', platform: 'IOS' }
      }
    });
    if (createB.status !== 201) die('Failed to create bundle ID in Apple Developer', createB.body);
    appleBundleId = createB.body.data.id;
    ok(`Created: ${appleBundleId}`);
  }

  // ── Step 5: Create App Store Provisioning Profile via Apple API ───────────
  console.log('\n[5/8] Creating App Store Provisioning Profile at Apple...');
  const profResp = await apple('POST', '/profiles', jwt, {
    data: {
      type: 'profiles',
      attributes: { name: `MyTools App Store ${Date.now()}`, profileType: 'IOS_APP_STORE' },
      relationships: {
        bundleId: { data: { type: 'bundleIds', id: appleBundleId } },
        certificates: { data: [{ type: 'certificates', id: appleCertId }] },
        devices: { data: [] }
      }
    }
  });
  if (profResp.status !== 201) die('Apple API rejected provisioning profile creation', profResp.body);
  const appleProfileContent = profResp.body.data.attributes.profileContent;
  const appleProfileId      = profResp.body.data.id;
  const appleProfileUUID    = profResp.body.data.attributes.uuid;
  ok(`UUID ${appleProfileUUID}`);

  // ── Step 6: EAS — get account + app IDs ───────────────────────────────────
  console.log('\n[6/8] Fetching EAS account and app IDs...');
  const easInfo = await eas(`
    query {
      account { byName(accountName: "${EAS_ACCOUNT}") { id } }
      app { byFullName(fullName: "@${EAS_ACCOUNT}/${EAS_APP_SLUG}") { id } }
    }
  `);
  if (easInfo.body.errors) die('EAS info query failed', easInfo.body.errors);
  const accountId = easInfo.body.data.account.byName.id;
  const appId     = easInfo.body.data.app.byFullName.id;
  ok(`accountId=${accountId}`);
  ok(`appId=${appId}`);

  // ── Step 7: EAS — create/find Apple Team ──────────────────────────────────
  console.log('\n[7/8] Registering Apple Team in EAS...');
  // Try to find existing team
  const teamQuery = await eas(`
    query {
      account { byName(accountName: "${EAS_ACCOUNT}") {
        appleTeams { id appleTeamIdentifier }
      } }
    }
  `);
  let easTeamId = null;
  const existingTeams = teamQuery.body.data?.account?.byName?.appleTeams || [];
  const existingTeam  = existingTeams.find(t => t.appleTeamIdentifier === TEAM_ID);
  if (existingTeam) {
    easTeamId = existingTeam.id;
    ok(`Found existing EAS team: ${easTeamId}`);
  } else {
    const createTeam = await eas(`
      mutation CreateTeam($input: AppleTeamInput!, $accountId: ID!) {
        appleTeam {
          createAppleTeam(appleTeamInput: $input, accountId: $accountId) {
            id appleTeamIdentifier
          }
        }
      }
    `, { input: { appleTeamIdentifier: TEAM_ID, appleTeamName: 'MyTools Group', appleTeamType: TEAM_TYPE }, accountId });
    if (createTeam.body.errors) die('Failed to create Apple Team in EAS', createTeam.body.errors);
    easTeamId = createTeam.body.data.appleTeam.createAppleTeam.id;
    ok(`Created EAS team: ${easTeamId}`);
  }

  // ── Step 8: EAS — upload cert, upload profile, wire everything ────────────
  console.log('\n[8/8] Uploading credentials to EAS and wiring build profile...');

  // 8a. Clean up any existing EAS Distribution Certs for this account (avoid duplicates)
  const existingEasCerts = await eas(`
    query { account { byName(accountName: "${EAS_ACCOUNT}") {
      appleDistributionCertificates { id serialNumber }
    } } }
  `);
  const oldCerts = existingEasCerts.body.data?.account?.byName?.appleDistributionCertificates || [];
  for (const c of oldCerts) {
    await eas(`mutation { appleDistributionCertificate { deleteAppleDistributionCertificate(id: "${c.id}") { id } } }`);
    console.log(`      Removed old EAS cert: ${c.id}`);
  }

  // Upload Distribution Certificate
  const createCert = await eas(`
    mutation CreateCert($input: AppleDistributionCertificateInput!, $accountId: ID!) {
      appleDistributionCertificate {
        createAppleDistributionCertificate(
          appleDistributionCertificateInput: $input, accountId: $accountId
        ) { id serialNumber }
      }
    }
  `, {
    input: {
      certP12: p12B64,
      certPassword: P12_PASS,
      developerPortalIdentifier: appleCertId,
      appleTeamId: easTeamId
    },
    accountId
  });
  if (createCert.body.errors) die('Failed to upload Distribution Certificate to EAS', createCert.body.errors);
  const easCertId = createCert.body.data.appleDistributionCertificate.createAppleDistributionCertificate.id;
  ok(`Distribution cert uploaded: ${easCertId}`);

  // 8b. Create Apple App Identifier in EAS
  // First check if it already exists
  const appIdQuery = await eas(`
    query {
      account { byName(accountName: "${EAS_ACCOUNT}") {
        appleAppIdentifiers { id bundleIdentifier }
      } }
    }
  `);
  let easAppIdentifierId = null;
  const existingIds = appIdQuery.body.data?.account?.byName?.appleAppIdentifiers || [];
  const existingId  = existingIds.find(i => i.bundleIdentifier === BUNDLE_ID);
  if (existingId) {
    easAppIdentifierId = existingId.id;
    ok(`Found existing EAS bundle ID: ${easAppIdentifierId}`);
  } else {
    const createId = await eas(`
      mutation CreateAppId($input: AppleAppIdentifierInput!, $accountId: ID!) {
        appleAppIdentifier {
          createAppleAppIdentifier(appleAppIdentifierInput: $input, accountId: $accountId) {
            id bundleIdentifier
          }
        }
      }
    `, { input: { bundleIdentifier: BUNDLE_ID, appleTeamId: easTeamId }, accountId });
    if (createId.body.errors) die('Failed to create App Identifier in EAS', createId.body.errors);
    easAppIdentifierId = createId.body.data.appleAppIdentifier.createAppleAppIdentifier.id;
    ok(`EAS bundle identifier created: ${easAppIdentifierId}`);
  }

  // 8c. Upload Provisioning Profile
  const createProf = await eas(`
    mutation CreateProfile($input: AppleProvisioningProfileInput!, $accountId: ID!, $appIdId: ID!) {
      appleProvisioningProfile {
        createAppleProvisioningProfile(
          appleProvisioningProfileInput: $input,
          accountId: $accountId,
          appleAppIdentifierId: $appIdId
        ) { id }
      }
    }
  `, {
    input: {
      appleProvisioningProfile: appleProfileContent,
      developerPortalIdentifier: appleProfileId
    },
    accountId,
    appIdId: easAppIdentifierId
  });
  if (createProf.body.errors) die('Failed to upload Provisioning Profile to EAS', createProf.body.errors);
  const easProfileId = createProf.body.data.appleProvisioningProfile.createAppleProvisioningProfile.id;
  ok(`Provisioning profile uploaded: ${easProfileId}`);

  // 8d. Create iOS App Credentials (container linking app ↔ bundle identifier)
  // Check if one already exists for this app + bundle ID combo
  const existingAppCreds = await eas(`
    query {
      app { byFullName(fullName: "@${EAS_ACCOUNT}/${EAS_APP_SLUG}") {
        iosAppCredentials(filter: {appleAppIdentifierId: null}) { id }
      } }
    }
  `);
  let iosAppCredentialsId = null;
  const existingCred = existingAppCreds.body.data?.app?.byFullName?.iosAppCredentials?.[0];
  if (existingCred) {
    iosAppCredentialsId = existingCred.id;
    ok(`Reusing existing iOS App Credentials container: ${iosAppCredentialsId}`);
  } else {
    const createAppCreds = await eas(`
      mutation CreateAppCreds($input: IosAppCredentialsInput!, $appId: ID!, $appIdId: ID!) {
        iosAppCredentials {
          createIosAppCredentials(
            iosAppCredentialsInput: $input, appId: $appId, appleAppIdentifierId: $appIdId
          ) { id }
        }
      }
    `, {
      input: { appleTeamId: easTeamId },
      appId,
      appIdId: easAppIdentifierId
    });
    if (createAppCreds.body.errors) die('Failed to create iOS App Credentials in EAS', createAppCreds.body.errors);
    iosAppCredentialsId = createAppCreds.body.data.iosAppCredentials.createIosAppCredentials.id;
    ok(`iOS App Credentials container: ${iosAppCredentialsId}`);
  }

  // 8e. Create or update iOS App Build Credentials (links cert + profile for APP_STORE)
  // First check if APP_STORE build credentials already exist for this app credentials container
  const existingBuildCredsQ = await eas(`
    query {
      app { byFullName(fullName: "@${EAS_ACCOUNT}/${EAS_APP_SLUG}") {
        iosAppCredentials(filter: {appleAppIdentifierId: null}) {
          iosAppBuildCredentialsArray {
            id iosDistributionType
          }
        }
      } }
    }
  `);
  const buildCredsArray = existingBuildCredsQ.body.data
    ?.app?.byFullName?.iosAppCredentials?.[0]
    ?.iosAppBuildCredentialsArray || [];
  const existingBuildCred = buildCredsArray.find(b => b.iosDistributionType === 'APP_STORE');

  let buildCredId;
  if (existingBuildCred) {
    // Update existing build credentials with new cert + profile
    const updateCert = await eas(`
      mutation { iosAppBuildCredentials {
        setDistributionCertificate(id: "${existingBuildCred.id}", distributionCertificateId: "${easCertId}") { id }
      } }
    `);
    if (updateCert.body.errors) die('Failed to update Distribution Certificate on build credentials', updateCert.body.errors);
    const updateProf = await eas(`
      mutation { iosAppBuildCredentials {
        setProvisioningProfile(id: "${existingBuildCred.id}", provisioningProfileId: "${easProfileId}") { id }
      } }
    `);
    if (updateProf.body.errors) die('Failed to update Provisioning Profile on build credentials', updateProf.body.errors);
    buildCredId = existingBuildCred.id;
    ok(`Updated existing build credentials (APP_STORE): ${buildCredId}`);
  } else {
    const createBuildCreds = await eas(`
      mutation CreateBuildCreds($input: IosAppBuildCredentialsInput!, $appCredId: ID!) {
        iosAppBuildCredentials {
          createIosAppBuildCredentials(
            iosAppBuildCredentialsInput: $input, iosAppCredentialsId: $appCredId
          ) { id iosDistributionType }
        }
      }
    `, {
      input: {
        iosDistributionType: 'APP_STORE',
        distributionCertificateId: easCertId,
        provisioningProfileId: easProfileId
      },
      appCredId: iosAppCredentialsId
    });
    if (createBuildCreds.body.errors) die('Failed to create iOS Build Credentials in EAS', createBuildCreds.body.errors);
    buildCredId = createBuildCreds.body.data.iosAppBuildCredentials.createIosAppBuildCredentials.id;
    ok(`Build credentials linked (APP_STORE): ${buildCredId}`);
  }

  // ── Clean up temp files ────────────────────────────────────────────────────
  for (const f of [keyFile, csrFile, cerFile, pemFile, p12File]) {
    try { fs.unlinkSync(f); } catch {}
  }

  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║  ✅  iOS credentials ready in EAS!       ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  Run "Build iOS (App Store)" workflow to  ║');
  console.log('║  produce a signed IPA for TestFlight.     ║');
  console.log('╚══════════════════════════════════════════╝\n');

})().catch(err => { console.error('\nUnexpected error:', err); process.exit(1); });
