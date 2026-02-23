#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════
 *  GO: Guide to Omaha — Google Sheets Admin Sync
 * ═══════════════════════════════════════════════════════════
 *
 *  Uses the Google Sheets API to sync events bidirectionally:
 *    PUSH: Pipeline events → Google Sheet (after each pipeline run)
 *    PULL: Google Sheet overrides → events.json (before build)
 *
 *  Setup:
 *    1. Create a Google Cloud project: console.cloud.google.com
 *    2. Enable "Google Sheets API"
 *    3. Create a Service Account → download JSON key
 *    4. Share your Google Sheet with the service account email
 *    5. Set env vars: GOOGLE_SHEET_ID and GOOGLE_SERVICE_ACCOUNT_KEY (path to JSON)
 *
 *  Usage:
 *    node scripts/sheets-sync.js --push     Push events.json → Google Sheet
 *    node scripts/sheets-sync.js --pull     Pull overrides → events.json
 *    node scripts/sheets-sync.js --setup    Create sheet with headers
 *    node scripts/sheets-sync.js --status   Show sync status
 */

const fs = require("fs");
const path = require("path");

const EVENTS_PATH = path.join(__dirname, "..", "data", "events.json");
const OVERRIDES_PATH = path.join(__dirname, "..", "data", "overrides.json");

// ═══ Google Sheets API helpers ═══
// Using raw REST API to avoid heavy googleapis npm dependency

const SHEET_ID = process.env.GOOGLE_SHEET_ID || "";
const SA_KEY_PATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "";
const SHEET_NAME = "Events"; // Tab name
const SCOPES = "https://www.googleapis.com/auth/spreadsheets";

// Headers for the Google Sheet (column order matters)
const HEADERS = [
  "id", "title", "date", "time", "venue", "cat", "price",
  "url", "ytId", "imageUrl", "feat", "hidden", "desc",
  "tags", "confidence", "source", "emoji",
];

// ═══ JWT Token Generation ═══
async function getAccessToken() {
  if (!SA_KEY_PATH || !fs.existsSync(SA_KEY_PATH)) {
    throw new Error(
      "Missing Google Service Account key.\n" +
      "Set GOOGLE_SERVICE_ACCOUNT_KEY to the path of your JSON key file.\n" +
      "See: https://cloud.google.com/iam/docs/creating-managing-service-account-keys"
    );
  }

  const key = JSON.parse(fs.readFileSync(SA_KEY_PATH, "utf8"));

  // Create JWT
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: key.client_email,
    scope: SCOPES,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })).toString("base64url");

  const crypto = require("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(key.private_key, "base64url");
  const jwt = `${header}.${payload}.${signature}`;

  // Exchange JWT for access token
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

// ═══ Sheets API Wrapper ═══
async function sheetsRequest(method, range, body, token) {
  const baseUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;
  const url = range
    ? `${baseUrl}/values/${encodeURIComponent(range)}${method === "PUT" ? "?valueInputOption=USER_ENTERED" : ""}`
    : baseUrl;

  const options = {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(url, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Sheets API ${res.status}: ${err.slice(0, 300)}`);
  }
  return res.json();
}

// ═══ SETUP: Create headers ═══
async function setup() {
  if (!SHEET_ID) {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║  GOOGLE SHEETS SETUP                                     ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  1. Go to sheets.google.com → create new spreadsheet    ║
║     Name it: "GO Guide — Event Admin"                   ║
║     Rename first tab to: "Events"                       ║
║                                                          ║
║  2. Copy the spreadsheet ID from the URL:               ║
║     https://docs.google.com/spreadsheets/d/XXXXX/edit   ║
║     The XXXXX part is your GOOGLE_SHEET_ID              ║
║                                                          ║
║  3. Google Cloud Console (console.cloud.google.com):    ║
║     → Create project "go-guide-omaha"                   ║
║     → Enable "Google Sheets API"                        ║
║     → Create Service Account                            ║
║     → Download JSON key                                 ║
║                                                          ║
║  4. Share the Google Sheet with the service account      ║
║     email (found in the JSON key file) as Editor         ║
║                                                          ║
║  5. Set environment variables:                           ║
║     GOOGLE_SHEET_ID=your-spreadsheet-id                 ║
║     GOOGLE_SERVICE_ACCOUNT_KEY=path/to/key.json         ║
║                                                          ║
║  6. Run: node scripts/sheets-sync.js --setup            ║
║     Then: node scripts/sheets-sync.js --push            ║
╚══════════════════════════════════════════════════════════╝
`);
    return;
  }

  console.log("Setting up Google Sheet...");
  const token = await getAccessToken();

  // Write headers
  await sheetsRequest("PUT", `${SHEET_NAME}!A1:Q1`, {
    values: [HEADERS.map(h => h.toUpperCase())],
  }, token);

  // Freeze header row
  await sheetsRequest("POST", null, {
    requests: [{
      updateSheetProperties: {
        properties: { sheetId: 0, gridProperties: { frozenRowCount: 1 } },
        fields: "gridProperties.frozenRowCount",
      },
    }],
  }, token);

  console.log("✓ Headers written and frozen. Ready for data push.");
}

// ═══ PUSH: events.json → Google Sheet ═══
async function push() {
  if (!SHEET_ID) { console.log("Missing GOOGLE_SHEET_ID. Run --setup first."); return; }

  const events = JSON.parse(fs.readFileSync(EVENTS_PATH, "utf8"));
  console.log(`Pushing ${events.length} events to Google Sheet...`);

  const token = await getAccessToken();

  // Read existing sheet to preserve manual overrides
  let existingRows = [];
  try {
    const existing = await sheetsRequest("GET", `${SHEET_NAME}!A2:Q`, null, token);
    existingRows = existing.values || [];
  } catch {}

  // Build map of existing overrides (by ID)
  const overrideMap = new Map();
  existingRows.forEach(row => {
    const id = row[0];
    if (!id) return;
    // Check if user has edited ytId, imageUrl, feat, or hidden columns
    const ytId = row[8] || "";
    const imageUrl = row[9] || "";
    const feat = row[10] || "";
    const hidden = row[11] || "";
    if (ytId || imageUrl || feat === "TRUE" || hidden === "TRUE") {
      overrideMap.set(String(id), { ytId, imageUrl, feat, hidden });
    }
  });

  // Convert events to rows, preserving overrides
  const rows = events.map(e => {
    const override = overrideMap.get(String(e.id));
    return [
      e.id,
      e.title || "",
      e.date || "",
      e.time || "",
      e.venue || "",
      e.cat || "",
      e.price || "",
      e.url || "",
      override?.ytId || e.ytId || "",      // Preserve manual ytId
      override?.imageUrl || e.imageUrl || "", // Preserve manual imageUrl
      override?.feat || (e.feat ? "TRUE" : "FALSE"),
      override?.hidden || "FALSE",
      e.desc || "",
      (e.tags || []).join(", "),
      e.confidence || "",
      e.source || "",
      e.emoji || "",
    ];
  });

  // Clear existing data and write new
  try {
    await sheetsRequest("PUT", `${SHEET_NAME}!A2:Q`, { values: [] }, token); // Clear
  } catch {}

  await sheetsRequest("PUT", `${SHEET_NAME}!A2:Q${rows.length + 1}`, {
    values: rows,
  }, token);

  console.log(`✓ Pushed ${rows.length} events (preserved ${overrideMap.size} manual overrides)`);
}

// ═══ PULL: Google Sheet overrides → overrides.json ═══
async function pull() {
  if (!SHEET_ID) { console.log("Missing GOOGLE_SHEET_ID. Run --setup first."); return; }

  console.log("Pulling overrides from Google Sheet...");
  const token = await getAccessToken();

  const result = await sheetsRequest("GET", `${SHEET_NAME}!A2:Q`, null, token);
  const rows = result.values || [];

  const overrides = {};
  let edited = 0, hidden = 0, featured = 0;

  rows.forEach(row => {
    const id = row[0];
    if (!id) return;

    const changes = {};
    let hasChanges = false;

    // Check editable fields for overrides
    if (row[8]) { changes.ytId = row[8]; hasChanges = true; }           // YouTube ID
    if (row[9]) { changes.imageUrl = row[9]; hasChanges = true; }       // Image URL
    if (row[10] === "TRUE") { changes.feat = true; hasChanges = true; featured++; }
    if (row[11] === "TRUE") { changes.hidden = true; hasChanges = true; hidden++; }

    // Also check if user edited title, venue, time, price, desc, cat
    // (compare only if values look manually edited — non-empty and different patterns)
    if (row[1] && row[1].includes("✏️")) { changes.title = row[1].replace("✏️", "").trim(); hasChanges = true; }

    if (hasChanges) {
      overrides[id] = changes;
      edited++;
    }
  });

  // Save overrides
  fs.writeFileSync(OVERRIDES_PATH, JSON.stringify(overrides, null, 2));
  console.log(`✓ Pulled ${edited} overrides (${featured} featured, ${hidden} hidden)`);
  console.log(`  Saved to ${OVERRIDES_PATH}`);

  // Apply overrides to events.json
  if (edited > 0 && fs.existsSync(EVENTS_PATH)) {
    const events = JSON.parse(fs.readFileSync(EVENTS_PATH, "utf8"));
    let applied = 0;

    events.forEach(e => {
      const ov = overrides[String(e.id)];
      if (!ov) return;

      if (ov.hidden) { e._hidden = true; applied++; return; }
      if (ov.ytId) e.ytId = ov.ytId;
      if (ov.imageUrl) e.imageUrl = ov.imageUrl;
      if (ov.feat) e.feat = true;
      if (ov.title) e.title = ov.title;
      applied++;
    });

    // Filter out hidden events
    const visible = events.filter(e => !e._hidden);
    fs.writeFileSync(EVENTS_PATH, JSON.stringify(visible, null, 2));
    console.log(`  Applied ${applied} overrides to events.json (${events.length - visible.length} hidden)`);
  }
}

// ═══ STATUS ═══
async function status() {
  if (!SHEET_ID) { console.log("Missing GOOGLE_SHEET_ID. Run --setup first."); return; }

  const token = await getAccessToken();
  const result = await sheetsRequest("GET", `${SHEET_NAME}!A1:Q`, null, token);
  const rows = result.values || [];

  console.log(`Sheet: ${rows.length - 1} events (including header)`);

  // Count overrides
  let featured = 0, hidden = 0, ytOverrides = 0, imgOverrides = 0;
  rows.slice(1).forEach(r => {
    if (r[8]) ytOverrides++;
    if (r[9]) imgOverrides++;
    if (r[10] === "TRUE") featured++;
    if (r[11] === "TRUE") hidden++;
  });

  console.log(`  Featured: ${featured}`);
  console.log(`  Hidden: ${hidden}`);
  console.log(`  YouTube overrides: ${ytOverrides}`);
  console.log(`  Image overrides: ${imgOverrides}`);

  // Events.json comparison
  if (fs.existsSync(EVENTS_PATH)) {
    const local = JSON.parse(fs.readFileSync(EVENTS_PATH, "utf8"));
    console.log(`  Local events.json: ${local.length} events`);
  }
}

// ═══ CLI ═══
const args = process.argv.slice(2);
const cmd = args[0] || "--setup";

(async () => {
  try {
    switch (cmd) {
      case "--push": await push(); break;
      case "--pull": await pull(); break;
      case "--setup": await setup(); break;
      case "--status": await status(); break;
      default:
        console.log("Usage: node scripts/sheets-sync.js [--push|--pull|--setup|--status]");
    }
  } catch (err) {
    console.error("✗ Error:", err.message);
    process.exit(1);
  }
})();
