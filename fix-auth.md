# Auth Fix Report

## Summary
This document explains the login crash seen in production and the implemented fix.

## Reported Error
- `Application error: a client-side exception has occurred`
- `Minified React error #310`

## Root Cause
The main page had a React Hook ordering bug in `src/app/page.tsx`:
- An authentication `useEffect` ran first.
- The component returned early (`loading` / `!isAuthenticated`).
- Another `useEffect` was declared **after** those conditional returns.

This produced different Hook execution order across renders, triggering React error #310.

## Fixes Implemented

### 1) Hook-order and page guard fix (`src/app/page.tsx`)
- Kept Hooks in stable order.
- Added Supabase session validation using:
  - `supabase.auth.getSession()`
  - `supabase.auth.onAuthStateChange()`
- Redirects unauthenticated users with `router.replace('/login')`.

### 2) Login flow migrated to Supabase Auth SDK (`src/app/login/page.tsx`)
- Replaced manual token fetch call with:
  - `supabase.auth.signInWithPassword({ email, password })`
- Added login-page session check to redirect authenticated users to `/`.

### 3) Supabase client auth settings aligned (`src/lib/supabase.ts`)
- `persistSession: true`
- `autoRefreshToken: true`
- `detectSessionInUrl: true`

## Validation
- Installed dependencies locally with `npm install`.
- Lint check passed for updated files:
  - `npx eslint src/app/page.tsx src/app/login/page.tsx src/lib/supabase.ts --max-warnings=0`

## Result
Login no longer crashes due to React Hook mismatch, and auth/session handling now uses Supabase SDK consistently.
