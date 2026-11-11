# Runbook — Claims Tracker (phone-friendly)

## Receipt scanning fails
1. Error mentions key/not configured: the secret `CLAIMS_GEMINI_API_KEY` is missing or
   revoked. Make a new key at https://aistudio.google.com/apikey (project "Claims
   tracker"), then Supabase Dashboard → Edge Functions → Secrets → set
   `CLAIMS_GEMINI_API_KEY`. No redeploy needed.
2. Error 404/not found: the function is not deployed. Actions → **Deploy Supabase
   function** → Run workflow (needs repo secret `SUPABASE_ACCESS_TOKEN`).
3. Quota errors: the free tier resets daily; try again tomorrow.
4. Claims can always be entered by hand meanwhile.

## Site not updating
Actions → **pages build and deployment** → re-run if red. Settings → Pages → Source:
Deploy from a branch → `main` / root. Custom domain is in `CNAME` (tax.imetrobert.com).

## Cannot sign in or claims do not load
Supabase Dashboard → Authentication → Users. Confirm the user exists and has an
`app_access` row for app `claims-tracker` (Access Rights page at access.imetrobert.com).

## Tax season (each year)
Summary tab → pick the tax year → export CSV/PDF for the accountant. Spot check totals
against a couple of insurer statements.

## Quarterly check (5 minutes)
Sign in, open Claims and Summary, confirm data loads.

## Retiring this app
Drop the `claims` table (export CSV first), delete `app_access` rows where
app='claims-tracker', remove DNS for tax.imetrobert.com, archive the repo. Follow the
pattern in Supabase-platform-'s `migration/decommission_cartmatch.sql`.
