# Runbook — Claims Tracker (phone-friendly)

## Receipt scanning fails ("Gemini API error")
The Gemini key was hardcoded in `index.html`, which is public. It must be revoked at
https://aistudio.google.com/apikey, so scanning stops working until the fix below.
Interim: claims can still be entered and edited by hand.
Proper fix (ask Claude while credits remain, or do later): move the Gemini call into a
Supabase Edge Function holding the key as a secret, and call it with the user's session.

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
