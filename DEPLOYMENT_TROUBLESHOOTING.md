# Supabase & Vercel Deployment Troubleshooting Guide

This document records issues encountered during the deployment of the Next.js + Supabase application on Vercel and their solutions.

## Issue 1: 500 INTERNAL_SERVER_ERROR (Proxy Invocation Failed)

**Error Message:**
```
500: INTERNAL_SERVER_ERROR
Code: PROXY_INVOCATION_FAILED
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
Update `lib/supabase/proxy.ts` to include a try-catch block and check for missing environment variables. This prevents the entire site from crashing (returning 500) if variables are missing, allowing debug logs to be seen.

---

## Issue 2: Redirect to Localhost after Login (Redirect URL Whitelist)

**Symptom:**
After clicking "Sign In" on the deployed Vercel site (or Custom Domain) and authenticating with Google, the browser redirects back to:
`http://localhost:3000/?code=...` 
instead of the production domain.

**Cause:**
Supabase security restrictions. The application sends a `redirectTo` URL (e.g., `https://www.bananaimage.online/auth/callback`), but Supabase rejects it because it is not in the **Redirect URLs** whitelist.
When the URL is rejected, Supabase falls back to the default **Site URL** (usually set to `localhost:3000` for development).

**Solution:**
You must manually add ALL production and preview domains to the Supabase whitelist.

1. Open **Supabase Dashboard**.
2. Navigate to **Authentication** -> **URL Configuration**.
3. Under **Redirect URLs**, click **Add URL**.
4. Add the following entries (ensure you include the wildcard `/**` to match all subpaths like `/auth/callback`):

   - **For Vercel Production:**
     `https://<your-project>.vercel.app/**`
   
   - **For Custom Domains (Crucial):**
     `https://www.bananaimage.online/**`
     `https://bananaimage.online/**` (if root domain is used)
   
   - **For Vercel Preview/Branch Deployments:**
     `https://*.vercel.app/**` (Wildcard allows all Vercel previews)

5. Click **Save**.
6. **Clear Browser Cache** or use Incognito mode to test. Old redirects are often cached by the browser.

**Note:**
- The "Site URL" field in Supabase is often locked (greyed out) or set to localhost. This is fine as long as your **Redirect URLs** are correctly configured with the actual domains you are using.