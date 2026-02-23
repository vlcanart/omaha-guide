# GO: Guide to Omaha

The most comprehensive event guide for the Omaha metro area. Scrapes 55+ venues and aggregators twice daily, uses AI to parse and classify events, validates ticket links, and deploys automatically.

## Quick Start

```bash
npm install
ANTHROPIC_API_KEY=sk-ant-... npm run pipeline:fast
npm run build
netlify deploy --prod --dir=out
```

## Architecture

```
55+ Sources → Jina Scrape → Claude Parse → Validate → Affiliate → Dedup → Deploy
```

**Pipeline modules:** `config.js` (sources + affiliates), `scraper.js` (Jina + Claude fallback), `parser.js` (AI extraction), `validator.js` (dates + URLs + dedup), `health.js` (reliability tracking), `alerts.js` (Slack/Discord webhooks)

## Commands

| Command | What it does |
|---------|-------------|
| `npm run pipeline` | Default scrape + parse + merge |
| `npm run pipeline:full` | All sources, higher concurrency |
| `npm run pipeline:tier1` | Major venues only |
| `npm run pipeline:dry` | Preview without saving |
| `npm run health` | Source reliability report |
| `npm run review:stats` | Event quality dashboard |
| `npm run review:low` | Show low-confidence events |
| `npm run review:dupes` | Find duplicates |
| `npm run review:expired` | Clean expired events |

## Automation

GitHub Actions runs 2x daily: **7 AM CT** (full) and **7 PM CT** (tier-1). Each run: scrape → parse → validate → commit → build → deploy.

**Required secrets:** `ANTHROPIC_API_KEY`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`
**Optional:** `JINA_API_KEY`, `SLACK_WEBHOOK_URL`, `DISCORD_WEBHOOK_URL`, affiliate IDs

## Affiliate Revenue

Ticket links auto-rewrite with tracking params. Apply at: Ticketmaster (impact.com, 4-8%), Eventbrite, AXS, Etix. Set IDs in `.env.local` or GitHub Secrets.

## Cost

~$0.50-1.00/run, ~$30-60/month at 2x daily. Jina free tier sufficient. Netlify free tier for hosting.
