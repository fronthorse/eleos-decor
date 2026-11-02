# Security PR verification — 2026-11-02

## Preview configuration blocker

The Vercel build for commit d710646 fails while prerendering /about with
`Error: supabaseUrl is required` from WishlistProvider. The project environment
metadata confirms NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
SUPABASE_SERVICE_ROLE_KEY, and NEXT_PUBLIC_ADMIN_EMAILS target Production only.
NEXT_PUBLIC_SITE_URL also targets Production only.

Only the production Supabase project is connected. The owner confirmed no test
environment is available. Do not copy its credentials into Preview or substitute
placeholder credentials to make the deployment look healthy.

To unblock:
1. Provision an isolated Supabase test project with the reviewed schema/RLS and
   synthetic products, customer and admin accounts. Do not copy customer data.
2. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for Preview
   with that project's public configuration. Set SUPABASE_SERVICE_ROLE_KEY only
   server-side, using the test project's key; configure NEXT_PUBLIC_ADMIN_EMAILS
   for the test admin only. Set NEXT_PUBLIC_SITE_URL to the intended test origin.
3. Configure test Auth redirect URLs for the Preview origin and /auth/callback.
4. Preview currently inherits RESEND_API_KEY and contact email settings shared with
   Production. Before transactional tests, isolate email delivery using a sandbox
   or disable delivery; do not send to real recipients. Isolate other paid API
   credentials as needed.
5. Rebuild Preview and test customer login/logout, persisted cart/wishlist,
   non-admin denial and admin access with the isolated accounts. Do not place real
   orders or edit production data.

## Security sources

- https://nextjs.org/blog/nextjs-security-update-october-14-2026
- https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3
- https://github.com/react/react/security/advisories/GHSA-h3gv-c5rc-p453
- https://github.com/websockets/ws/security/advisories/GHSA-96hv-2xvq-fx4p
- https://github.com/vercel/next.js/releases/tag/v16.4.4
- https://nextjs.org/blog/upcoming-nextjs-security-release-november-2026

Next.js 16.4.1 addresses the October upstream issues; React's 19.2 patched
line is 19.2.9. Next.js 16.4.4 was published November 2 and is the latest stable
patch found during this review. The November 3 security release is still pending;
review its advisories and upgrade instructions when published before release.

The image remotePatterns currently name the production Supabase hostname. An
isolated Preview also needs its own exact Supabase image hostname allowlisted;
check product thumbnails and galleries when configuring the test project.

## Verification results

- Clean npm ci: passed (388 packages installed). Initial registry idle timeout and
  interrupted extraction were resolved by a clean installation with longer timeout.
- npm run lint: passed, zero errors and eight existing warnings.
- npm run build: passed on Next.js 16.4.4 with the existing ignored .env.local,
  all 27 pages generated. Initial sandbox font download failure was resolved by
  allowing network access; no placeholder Supabase settings were substituted.
- npm audit --omit=dev: zero vulnerabilities. Full audit: 16 moderate,
  zero high/critical; all are development ESLint/minimatch dependency chains.
  The minimatch advisory is GHSA-g3hv-75wg-m249, fixed in 11.0.1. npm's proposed
  tooling downgrades and a cross-major minimatch override were not applied.
- Local production browser: shop rendered 24 products and product 120 detail.
- Guest cart: add, reload persistence, quantity change to 2, and removal after
  reload passed. Guest wishlist: add, reload persistence and removal passed.
- Customer login: empty required-field validation passed. Admin guest access
  displayed 'Admin login required'; its login link worked. Empty unauthenticated
  POSTs to both admin mutation endpoints returned 401 before database access.
- Browser console: local /_vercel/insights/script.js returned 404; no other
  application errors observed on the checked pages. The test browser blocked
  non-read requests except the explicit unauthenticated local API denial probes.
- Successful customer/admin login, logout, account cart/wishlist persistence and
  authorized admin access remain BLOCKED: no isolated backend or test accounts.
  Authenticated page effects can write saved carts/wishlists automatically, so
  production-backed login was not attempted. No emails, orders, or production
  data changes were performed.
- Preview remains BLOCKED by missing isolated Supabase configuration. No Vercel
  variables were changed and no production deployment or merge was performed.

Decision: not ready to merge until isolated integration testing and a successful
Preview build complete. Recheck the announced November 3 advisories before release.
