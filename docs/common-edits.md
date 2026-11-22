# Common edits — recipes (Claims Tracker, tax.imetrobert.com)

Everything is in `index.html` except the AI call (`supabase/functions/claims-extract/index.ts`).
Find the function with grep, edit only that block, commit to main (Pages redeploys in ~1 minute).
Never put a key in `index.html`. No analytics or extra scripts: this is financial and health data.

## 1. Add an insurer (e.g. Sun Life)
1. `index.html`, the `<select id="insurer-select">` (near line 166): add `<option value="Sun Life">Sun Life</option>`.
2. `buildExtractionPrompt(insurer)`: add a `'Sun Life': ...` line to the `hints` object describing
   the statement's column names (copy the Manulife or Blue Cross line and change the labels).
3. The insurer name is stored as text in `claims.insurer`; no database change needed.

## 2. Improve or fix what the AI reads wrongly
Edit the wording in `buildExtractionPrompt()` (the `common` text or one insurer hint). The five
fields it returns are person, service, service_date (YYYY-MM-DD), amount_submitted, amount_paid.
Rows can always be corrected on the review screen before saving.

## 3. Change the AI model (scan errors like "model not found" or quota 0)
`supabase/functions/claims-extract/index.ts`, the line `const MODEL = '...'`. Then Actions →
**Deploy Supabase function** → Run workflow (needs repo secret `SUPABASE_ACCESS_TOKEN`).
Google retires models often; use a current Flash-Lite name. The key itself is the Supabase secret
`CLAIMS_GEMINI_API_KEY` (Dashboard → Edge Functions → Secrets), changing it needs no redeploy.

## 4. Change the duplicate rule
`detectSuspectedDuplicates()`: groups rows by person + amount_submitted + service_date; if one row
in the group has amount_paid > 0, the zero-dollar rows are flagged `suspected` for review. You
always make the final call with the row buttons (`setStatus`, `resolveFlag`).

## 5. Change what the tax summary counts
`renderSummary()` and `summaryTotals()` (they must match): "not covered" = amount_submitted minus
amount_paid, active rows only, per person, for the chosen tax year. `tax_year` is set from the
service date in `saveReviewed()`.

## 6. Change an export (CSV or PDF for the accountant)
`exportSummaryCSV()`, `exportSummaryPDF()` (summary for one year) and `exportCSV()` (every row).
Add a column: add it in the header array and in the row array of the same function, same order.

## 7. Add a field to every claim (e.g. "receipt number")
Needs a database change: add the column in the Supabase SQL editor
(`alter table public.claims add column receipt_no text;`), no new grants needed for an existing
table. Then add it in `saveReviewed()`, `renderClaims()` and the exports. The table definition is
documented in the Supabase-platform- repo, `migration/schema_claims.sql`.

## 8. Wording, colours, labels
grep the visible text in `index.html` and change it.

## 9. Check it works after any change
Sign in on tax.imetrobert.com, Claims tab loads, Summary tab shows the totals, one CSV export opens.
If a sign-in or access problem appears, see RUNBOOK.md and access.imetrobert.com (app `claims-tracker`).
