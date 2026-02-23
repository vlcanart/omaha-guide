# CLAUDE.md — Agent Briefing for GO: Guide to Omaha

## Who You're Working With

Jeremy is the founder of Conversion Insights, a strategic AI advisory firm. He has 25 years of digital marketing experience but is newer to hands-on full-stack development. He's comfortable with concepts but may need guidance on terminal commands, especially on Windows. Be patient, explain what each command does, and confirm before running anything destructive.

## What This Project Is

GO: Guide to Omaha is a comprehensive event discovery app for the Omaha metro area. It scrapes 55+ venue websites twice daily using Jina Reader API + Claude AI, extracts structured event data, validates ticket URLs, appends affiliate tracking codes, and deploys as a static Next.js site to Netlify.

The app features 6 event categories (concerts, sports, comedy, festivals, family, arts), a date slider with presets, YouTube video previews with a sticky mini-player, save/share functionality, and a PWA that works offline.

## Tech Stack

- **Frontend**: Next.js 14 (static export), React 18, single-file app (`app/page.jsx`, 692 lines)
- **Pipeline**: Node.js scripts in `scripts/pipeline/` — Jina scraper, Claude parser, URL validator, affiliate rewriter, health monitor, Slack/Discord alerts
- **Data**: `data/events.json` is the "database" — flat JSON file, no external DB
- **Admin**: Google Sheets integration for event overrides (`scripts/sheets-sync.js`)
- **Hosting**: Netlify (static), GitHub Actions for CI/CD (2x daily)
- **APIs**: Anthropic Claude (event parsing), Jina Reader (web scraping)

## Project Structure

```
omaha-guide/
├── app/
│   ├── page.jsx           ← Entire app UI
│   ├── layout.jsx         ← SEO, analytics, PWA
│   ├── events-data.js     ← AUTO-GENERATED (don't edit)
│   └── globals.css
├── data/
│   ├── events.json        ← Event database (pipeline writes here)
│   └── cache/             ← Jina scrape cache
├── scripts/
│   ├── run-pipeline.js    ← Main pipeline orchestrator
│   ├── prebuild-events.js ← Merges data → events-data.js
│   ├── review-events.js   ← Quality review CLI
│   ├── sheets-sync.js     ← Google Sheets admin sync
│   ├── generate-sitemap.js
│   ├── generate-icons.js
│   ├── ingest-events.js   ← Legacy v1 ingestion (still works)
│   └── pipeline/
│       ├── config.js      ← 55 sources + affiliate config
│       ├── scraper.js     ← Jina + Claude fallback
│       ├── parser.js      ← Claude event extraction
│       ├── validator.js   ← Dates + URLs + dedup + affiliates
│       ├── health.js      ← Source reliability tracking
│       └── alerts.js      ← Slack/Discord notifications
├── public/
│   ├── sw.js              ← Service worker
│   ├── manifest.json      ← PWA manifest
│   ├── sitemap.xml, robots.txt, favicon.svg, icons
│   └── skyline.jpg        ← Hero image
├── .github/workflows/
│   └── nightly-ingest.yml ← 2x daily automation
├── .env.example           ← Template for env vars
├── package.json           ← 28 npm scripts
├── netlify.toml
└── next.config.js         ← Static export config
```

## Current State

- All code is written and verified — modules load, JSX is balanced, pipeline is complete
- No events have been ingested yet — `data/events.json` is empty `[]`
- The app has ~45 seed events hardcoded in `page.jsx` for initial content
- The site has NOT been deployed yet (Jeremy attempted Netlify CLI previously but it didn't complete)
- Google Sheets admin is NOT set up yet (optional, can do later)
- No GitHub repo exists yet

## What Needs to Happen (Deployment Checklist)

### Phase 1: Get It Running Locally

1. **Install dependencies**: `npm install`
2. **Create `.env.local`** with Jeremy's Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   Ask Jeremy for the key if not already set. He has one from previous sessions.

3. **Run the pipeline** (first real scrape):
   ```
   npm run pipeline:fast
   ```
   This skips URL validation for speed. Takes ~3-5 minutes. Will scrape all 55 sources and produce `data/events.json`.

   **Windows note**: If the command fails with env var issues, try:
   ```
   set ANTHROPIC_API_KEY=sk-ant-... && npm run pipeline:fast
   ```
   Or in PowerShell:
   ```
   $env:ANTHROPIC_API_KEY="sk-ant-..."; npm run pipeline:fast
   ```

4. **Review results**:
   ```
   npm run review:stats
   ```
   This shows category breakdown, source coverage, confidence scores. Expect 50-200+ events on first run.

5. **Build the site**:
   ```
   npm run build
   ```
   This runs prebuild (generates events-data.js) + sitemap + Next.js static export → produces `out/` folder.

6. **Test locally** (optional):
   ```
   npx serve out
   ```
   Opens at http://localhost:3000. Verify events show up, cards look good, video player works.

### Phase 2: Deploy to Netlify

Jeremy has used Netlify before. Two options:

**Option A: Netlify CLI (recommended)**
```
npm install -g netlify-cli
netlify login
netlify init        # or netlify link if site already exists
netlify deploy --prod --dir=out
```

**Option B: Drag and drop**
Go to app.netlify.com → Sites → drag the `out/` folder onto the page.
Note: Jeremy reported this crashed his browser last time. CLI is more reliable.

### Phase 3: GitHub Setup (enables automation)

1. **Create GitHub repo**:
   ```
   git init
   git add .
   git commit -m "Initial commit - GO: Guide to Omaha v7"
   ```
   Then create repo on github.com and push:
   ```
   git remote add origin https://github.com/USERNAME/omaha-guide.git
   git push -u origin main
   ```
   Or use GitHub Desktop for a visual experience.

2. **Set GitHub Secrets** (Settings → Secrets and variables → Actions):
   - `ANTHROPIC_API_KEY` — Jeremy's Claude API key
   - `NETLIFY_AUTH_TOKEN` — from Netlify account settings → Applications → Personal access tokens
   - `NETLIFY_SITE_ID` — from Netlify site dashboard → Site configuration → General → Site ID

3. **Test the workflow**: Go to Actions tab → "Event Pipeline" → "Run workflow" → select "full" → Run. Watch it execute.

### Phase 4: Optional Enhancements (do later)

- **Google Sheets admin**: Run `npm run sheets:setup` for instructions. Requires a Google Cloud project with Sheets API enabled + service account. Can walk Jeremy through this.
- **Slack/Discord alerts**: Create a webhook URL, add as `SLACK_WEBHOOK_URL` or `DISCORD_WEBHOOK_URL` secret.
- **Affiliate programs**: Apply at impact.com (Ticketmaster), set IDs in GitHub Secrets.
- **Plausible analytics**: Sign up at plausible.io, update `data-domain` in `app/layout.jsx`.
- **Custom domain**: Configure in Netlify → Domain settings.

## Key Commands Reference

| Command | What it does |
|---------|-------------|
| `npm run pipeline` | Scrape + parse + merge events |
| `npm run pipeline:fast` | Same but skip URL validation (faster) |
| `npm run pipeline:tier1` | Major venues only |
| `npm run pipeline:dry` | Preview without saving |
| `npm run build` | Build static site → out/ |
| `npm run review:stats` | Event quality dashboard |
| `npm run review:low` | Low-confidence events |
| `npm run health` | Source reliability report |
| `npm run sheets:setup` | Google Sheets setup guide |

## Important Notes

- **Windows**: Environment variables work differently. Use `set VAR=value &&` (cmd) or `$env:VAR="value";` (PowerShell) before commands.
- **API costs**: Each full pipeline run costs ~$0.50-1.00 in Claude API credits. Jeremy is aware.
- **Jina free tier**: 20 RPM, which is tight for 55 sources. The scraper has 1.2s rate limiting built in. If timeouts occur, Jeremy can get a free Jina API key at jina.ai to bump to 200 RPM.
- **Seed events**: ~45 events are hardcoded in page.jsx. These auto-expire as their dates pass. Once the pipeline is producing enough volume, they become unnecessary.
- **The `out/` folder**: This is what gets deployed. It's the compiled static site. Don't edit files in here — edit source files and rebuild.
- **`events-data.js`**: This file is auto-generated by `prebuild-events.js`. Never edit it manually.

## If Something Goes Wrong

- **Pipeline produces 0 events**: Check `ANTHROPIC_API_KEY` is set correctly. Run `npm run pipeline:dry` to see output without saving.
- **Build fails**: Usually a syntax error in page.jsx. Run `node -e "require('fs').readFileSync('app/page.jsx','utf8')"` to check it's readable. Check bracket balance.
- **Netlify deploy fails**: Make sure `out/` directory exists and contains `index.html`. Run `ls out/` to verify.
- **GitHub Actions fail**: Check the Actions tab for error logs. Most common: missing secrets, API key expired.

## Context From Previous Sessions

Jeremy and Claude (in claude.ai) built this over several sessions:
- v1-v4: Core app with categories, date slider, venue cards, save/share
- v5: YouTube video integration (sticky player, facade thumbnails)
- v6: Full Jina + Claude pipeline with 55+ sources
- v7: Production hardening — alerts, quality review, Google Sheets admin, PWA, SEO, affiliate system, cost tracking

The app is feature-complete. The main task now is deployment and getting the automation running.
