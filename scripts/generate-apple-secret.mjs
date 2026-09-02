// Generates the "Sign in with Apple" client secret (a signed JWT).
// Usage:
//   APPLE_TEAM_ID=XXXX APPLE_KEY_ID=YYYY APPLE_SERVICES_ID=com.dirtridecamp.web \
//   APPLE_P8_PATH=./AuthKey_YYYY.p8 node scripts/generate-apple-secret.mjs
//
// The Services ID is your APPLE_ID env var; the printed token is your APPLE_SECRET.
// Apple secrets expire after at most 6 months — re-run this to refresh.

import { readFileSync } from "node:fs";
import { SignJWT, importPKCS8 } from "jose";

const teamId = process.env.APPLE_TEAM_ID;
const keyId = process.env.APPLE_KEY_ID;
const servicesId = process.env.APPLE_SERVICES_ID;
const p8Path = process.env.APPLE_P8_PATH;

if (!teamId || !keyId || !servicesId || !p8Path) {
  console.error("Missing env vars. Required: APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_SERVICES_ID, APPLE_P8_PATH");
  process.exit(1);
}

const privateKeyPem = readFileSync(p8Path, "utf8");
const key = await importPKCS8(privateKeyPem, "ES256");

const now = Math.floor(Date.now() / 1000);
const sixMonths = 60 * 60 * 24 * 180; // Apple max

const token = await new SignJWT({})
  .setProtectedHeader({ alg: "ES256", kid: keyId })
  .setIssuer(teamId)
  .setIssuedAt(now)
  .setExpirationTime(now + sixMonths)
  .setAudience("https://appleid.apple.com")
  .setSubject(servicesId)
  .sign(key);

console.log("\nAPPLE_ID=" + servicesId);
console.log("APPLE_SECRET=" + token + "\n");
console.log("Add both to Northflank env vars. Re-run before this expires (max 6 months).");
