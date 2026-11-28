# If something breaks (read this first, then fix only what it names)

1. **A red check or an email from GitHub:** Actions tab, open the failed run, read the last 20 lines of the red step. "Pages build and deployment" red once: re-run the job (usually a transient GitHub error).
2. **A pull request (for example from Dependabot) has a red "PR build check" or "Checks":** do not merge it; open the red step and fix or close the PR.
3. **Receipt scanning fails:** `RUNBOOK.md` "Receipt scanning fails". Gemini runs only in the `claims-extract` Edge Function; redeploy it with Actions, Deploy Supabase function.
4. **Site not updating / cannot sign in / claims do not load:** the matching sections of `RUNBOOK.md`. Access is `has_app_access('claims-tracker')` (granted at access.imetrobert.com).
5. Never put a key in `index.html`; only the Supabase publishable key belongs there.
