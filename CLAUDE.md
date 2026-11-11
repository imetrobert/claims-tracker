# claims-tracker (Claims Tracker) — read this first, it is the map

Private family dental/health claims ledger at tax.imetrobert.com, for the accountant's
tax submission. One file: `index.html` (HTML + CSS + JS, no build). Supabase auth and
`claims` table (shared project). Receipt/claim-form images are read with Gemini vision.
Maintenance steps: `RUNBOOK.md`.

## Rules (non-negotiable)
- NO secret in `index.html`. Only the Supabase publishable key belongs there.
  KNOWN ISSUE: a Gemini key was hardcoded at `GEMINI_API_KEY` (revoke it; see RUNBOOK).
  Target fix: call Gemini through a Supabase Edge Function that holds the key, the same
  pattern as the Marketplace Generator's `generate` function. Do not put a new key back
  into this file.
- New Supabase tables: explicit Data API grants in the same migration; access via
  `has_app_access('claims-tracker')`.
- This is financial/health data: no analytics, no third-party scripts beyond supabase-js.
- Free tier only.

## Where things are (all in `index.html`)
- Config block near the top (`SUPABASE_URL`, anon key) · `showTab()` tabs: upload, claims, summary
- Upload and AI extraction: `callGeminiVision()`, `buildExtractionPrompt()`, `renderReview()`,
  `saveReviewed()`
- Ledger: `loadClaims()`, `renderClaims()` · Summary and exports: `renderSummary()`,
  `exportSummaryCSV()`, `exportSummaryPDF()`, `exportCSV()`
- Hosting: GitHub Pages from `main`, custom domain in `CNAME`

## Cheap-change guide
- Copy/text: grep the string in `index.html`, edit, commit to main (Pages redeploys).
- Insurer-specific extraction wording: `buildExtractionPrompt()`.
- Keep-alive workflow was removed on purpose: the shared Supabase project is kept busy by
  the ETF app's schedule, and GitHub had disabled the workflow for inactivity anyway.
