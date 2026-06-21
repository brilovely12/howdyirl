@AGENTS.md

# Howdy IRL

Local community board (groups + events) for one city at launch (Huntsville, AL).
Domain: howdyirl.com. Sister site to boopem.com.

## Stack
- Next.js 16 (App Router, RSC, TS) + Tailwind 4. Quicksand font.
- Supabase Postgres. Public reads via `@supabase/supabase-js` (anon, `src/lib/supabase.ts` + `src/lib/data.ts`); auth-aware reads/session via `@supabase/ssr` (`src/lib/supabase/server.ts` + `client.ts`).

## Next.js 16 gotchas (this is NOT the Next.js you know — read node_modules/next/dist/docs)
- **Middleware is renamed to Proxy.** Use `src/proxy.ts` exporting `export function proxy(request)`. `middleware.ts` errors with "Cannot find the middleware module".
- `searchParams` and `params` in pages are Promises — `await` them.

## Auth
- Supabase Auth against the shared project, so a person is ONE `auth.users` row across boopem + Howdy. Providers (email/password, Google, Apple) are already configured for boopem and reused.
- Email confirmation is ON (project setting) — signup shows a "check your email" notice; OAuth/confirmation land on `/auth/callback`.
- **Handle is required.** `howdy.ensure_member(p_handle)` (SECURITY DEFINER RPC) provisions a `howdy.members` row: prefers the passed handle, else the handle stored in auth user_metadata at signup. It does NOT fall back to the email. Returns the existing member if present; returns NULL (no row) if no handle is available; raises `handle_taken` / `handle_invalid`. `is_admin` set if the email is in the function's allowlist (currently `briannamcr@gmail.com`).
- Signup form requires a handle and stores it in `auth.signUp({ options: { data: { handle } } })` so it survives email confirmation. OAuth users (no handle) and taken-handle cases are routed to **`/onboarding`** to choose one. Handle normalize/validate helpers in `src/lib/handle.ts`.
- **PostgREST gotcha:** a function returning a composite type serializes a `NULL` return as an all-null object `{"id":null,...}` (HTTP 200), NOT JSON `null`. So callers check `data?.id`, not `!data`, to detect "no member" (see `provisionMember`, AuthForm, OnboardingForm).
- `getSessionUser()` / `provisionMember()` in `src/lib/auth.ts`. `src/proxy.ts` refreshes the session cookie each request. After client sign-in, AuthForm does a **full navigation** so the shared layout's Header re-renders with the session (router.push alone leaves the persisted layout stale).
- **Manual step for Google/Apple to work:** add Howdy's redirect URLs to Supabase → Authentication → URL Configuration → Redirect URLs: `http://localhost:3100/auth/callback` (dev) and `https://howdyirl.com/auth/callback` (prod). Email/password needs nothing.

## Database — IMPORTANT
- Howdy shares the **boopem Supabase project** (`nrpxtxtrpnqqkrvviqid`), isolated in a dedicated **`howdy` Postgres schema** (boopem owns `public`). Shared `auth.users` pool — intentional, so the two sister sites can merge later.
- The `howdy` schema is exposed to PostgREST (`pgrst.db_schemas`); the JS client is pinned to it via `{ db: { schema: "howdy" } }`.
- RLS is on everywhere (default-deny). Public read policies cover live groups/events, published pages, tags, cities, comments, and updates. `members` has no public read policy — listings carry a denormalized `creator_handle` so anon never needs it.
- Search: each listing has a generated lowercased `search_text` column (name + description + tags, plus host group name for events) with a `pg_trgm` GIN index. Queries `ILIKE '%term%'` per whitespace term (AND), combined with the tag filter, sorted by recency (groups) / soonest (events), paginated with `range()`.

## Dev
- `npm run dev` (port 3000 may be taken by the unrelated ratethemet app; this project's preview launch config pins port 3100).
- Env in `.env.local` (Supabase URL + publishable anon key + default city).

## Posting (write path)
- Inserts go through SECURITY DEFINER RPCs `howdy.create_group` / `howdy.create_event`, which set creator/city/status server-side, authorize the caller (member required; events can only be hosted by a group the caller owns), filter tags to the vocabulary, convert event time from Central wall-clock to timestamptz, and bump the host group's `updated_at`. Verified end-to-end via authenticated HTTP calls.
- Forms are **client components** (`GroupForm`/`EventForm`) that call the RPC directly via the browser client (same proven pattern as `AuthForm`), then `window.location.assign` to the new listing. NOTE: an earlier attempt used `useActionState` + server actions, but programmatic/synthetic submits didn't reliably dispatch the server action in this setup — the client-RPC pattern is what we settled on. Pages `/groups/new` + `/events/new` guard auth + member.
- Post buttons link to `/groups/new` / `/events/new` when logged in, else `/login`. "Claim a group" is still a stub.

## Built so far
Groups & events lists with server-side search (full spec), tag filter, prev/next paging, detail pages, CMS pages, shared chrome. Auth: email/password + Google/Apple (pending redirect-URL allowlist), member provisioning with required handle + onboarding, auth-aware header, gated actions. Posting groups & events.

## Gotchas learned
- `src/proxy.ts` (not middleware.ts) refreshes the session; it **skips non-GET requests** so health-check/server-action floods don't churn refresh-token rotation. Under heavy concurrent requests an `@supabase/ssr` session can still rotate out — watch for it.
- Turbopack dev sometimes serves a **stale CSS/JS bundle** after edits; `rm -rf .next` + restart fixes it.

## Not yet built (follow-ups)
Editing/deleting listings, join/RSVP + notification prefs, comments write/reply/edit, profiles + settings, claim flow, admin console, notification center, transactional email, image uploads, fuller "my stuff", password reset.
