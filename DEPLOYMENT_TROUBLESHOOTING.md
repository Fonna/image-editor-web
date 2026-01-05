# Supabase & Vercel Deployment Troubleshooting Guide

This document records issues encountered during the deployment of the Next.js + Supabase application on Vercel and their solutions.

## Issue 1: 500 INTERNAL_SERVER_ERROR (Middleware Invocation Failed)

**Error Message:**
```
500: INTERNAL_SERVER_ERROR
Code: MIDDLEWARE_INVOCATION_FAILED
ID: pdx1::...
```

**Cause:**
Missing environment variables in Vercel. While `.env.local` works for local development, Vercel requires environment variables to be explicitly set in the project settings for production.

**Solution:**
1. Go to Vercel Dashboard -> Project -> **Settings** -> **Environment Variables**.
2. Add the following variables (values should match your `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Redeploy** the project (Settings -> Deployments -> Redeploy) for changes to take effect. Do not use build cache if possible.

**Code Hardening (Optional but Recommended):**
Update `lib/supabase/middleware.ts` to include a try-catch block and check for missing environment variables. This prevents the entire site from crashing (returning 500) if variables are missing, allowing debug logs to be seen.

---

## Issue 2: Redirect to Localhost after Login

**Symptom:**
After clicking "Sign In" on the deployed Vercel site and authenticating with Google, the browser redirects to:
`http://localhost:3000/?code=...` instead of the Vercel domain.

**Cause:**
Supabase security settings. The `redirectTo` URL sent by the application (your Vercel domain) was not whitelisted in the Supabase dashboard. Supabase defaults to the "Site URL" (often set to localhost during dev) when an unauthorized redirect URL is provided.

**Solution:**
1. Open **Supabase Dashboard**.
2. Navigate to **Authentication** -> **URL Configuration**.
3. Under **Redirect URLs**, click **Add URL**.
4. Add your production Vercel URL with the callback path:
   `https://<your-project>.vercel.app/auth/callback`
5. Click **Save**.

**Finding your Vercel URL:**
- **Project Overview:** Look under the "Domains" section.
- **Settings -> Domains:** Lists all active domains.

**Tip for Preview Deployments:**
To support Vercel preview URLs (e.g., for pull requests), add a wildcard pattern to Supabase Redirect URLs:
`https://*-<your-team>.vercel.app/auth/callback`
