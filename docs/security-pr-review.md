# Security PR verification — 2026-11-02

## Current status

PR #1 remains open. Preview integration checks are progressing; production RLS
findings below remain unresolved.
The original Preview failed with `supabaseUrl is required` while prerendering /about.
Supabase variables had been scoped to Production only.

An isolated Supabase project, eleos-decor-test, now exists. The owner ran the
reviewed test-only SQL files in supabase/: eight tables with RLS, admin-only
storage write policies, three clearly labeled synthetic products, and two print
variants. Two confirmed test accounts exist; only admin-test@example.com has the
trusted app_metadata.role = admin claim. No production customer data was copied.

Vercel metadata now shows separate Preview entries for NEXT_PUBLIC_SUPABASE_URL,
NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY and
NEXT_PUBLIC_ADMIN_EMAILS. Production entries remain separate and unchanged.
Values were not printed. End-to-end checks must still confirm they match the test
project and that the server key works. The existing variable names accept the
new publishable/secret key values configured by the owner.

## Changes and checks

- Next.js and eslint-config-next pinned to 16.4.4; React/React DOM remain 19.2.9.
- Clean npm ci passed. Production audit: zero vulnerabilities. Full audit: 16
  moderate development ESLint/minimatch findings; no high/critical findings.
  Cross-major minimatch overrides and npm's tooling downgrades were not applied.
- Lint passes with eight existing warnings. Local production build passes with
  the existing ignored environment, generating all 27 pages.
- Image allowlists and resumable upload endpoints now derive from the configured
  Supabase URL. Preview uploads no longer hardcode production storage. Hosted
  projects use their direct storage hostname; local/custom hosts retain theirs.
- Both email POST routes refuse delivery in Vercel Preview before reading email
  configuration or invoking Resend. The email readiness route reports disabled.
  RESEND_API_KEY is still shared between Production and Preview in Vercel; remove
  Preview from its scope as credential hygiene. No real emails were sent.
- node scripts/verify-preview-isolation.mjs checks project-specific URL routing,
  local URL support, and both Preview email guards without credentials/providers.
- Earlier local browser checks passed: product loading/detail, guest cart
  add/quantity/remove persistence, guest wishlist add/remove persistence, login
  required-field validation, and unauthenticated admin UI/API denial.
- The owner verified on isolated Preview: customer login/logout and session refresh,
  cart/wishlist persistence across refresh and a fresh login, customer denial of
  admin access, and admin login and session refresh. These are user-performed checks.
- The owner uploaded a test image and edited the test table's description. Read-only
  inspection confirmed the uploaded WebP exists in the test bucket and the saved
  product points to it. Original image GET returned 200; its transformation URL
  returned 403 FeatureNotEnabled. Preview now defaults to original image URLs;
  Production retains transformations. NEXT_PUBLIC_SUPABASE_IMAGE_TRANSFORMS can
  explicitly override this per deployment. No paid feature was enabled.
- The first isolated Preview (f840690) reached READY and browser inspection showed
  exactly the three synthetic products. Its email readiness route reported delivery
  disabled. The image correction is awaiting a new Preview verification.
- SQL setup was validated in rolled-back transactions before owner execution.
  Owner cart isolation, denial of customer product writes, admin product updates
  and public catalog reads passed. All eight tables have RLS enabled; the test
  project's security advisor reported no findings after table setup.

## Remaining setup and release gates

1. Complete the image correction's Preview build and verify the saved upload displays
   on the product page and shop cards. Confirm admin display with the owner.
2. Set test Auth redirect URLs and Site URL for the intended Preview origin before
   OAuth or email-link tests. Password login can be checked first. Never use real
   invitation/reset emails or production OAuth credentials for test flows.
3. Remove Preview scope from the shared Resend key. Consider a separate Gemini
   key before paid chatbot tests; Gemini remains shared and was not exercised.
4. Confirm variant selection and separate cart entries for Print A and Print B;
   test uploads must go to the isolated products bucket. No real orders or
   production writes are authorized.
5. Address the existing production RLS weakness before calling the security work
   complete: metadata inspection found unconditional authenticated product/variant
   write policies and inquiry read/update policies. The test policies use admin
   claims instead; production policies were inspected only and remain unchanged.
   Production remediation needs an explicit migration and app/admin authorization
   alignment, with testing. This PR has not been merged or deployed to production.
6. Review the announced November 3 advisories and patch instructions when published.

## Sources

- https://nextjs.org/blog/nextjs-security-update-october-14-2026
- https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3
- https://github.com/react/react/security/advisories/GHSA-h3gv-c5rc-p453
- https://github.com/websockets/ws/security/advisories/GHSA-96hv-2xvq-fx4p
- https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249
- https://github.com/vercel/next.js/releases/tag/v16.4.4
- https://nextjs.org/blog/upcoming-nextjs-security-release-november-2026
- https://supabase.com/docs/guides/storage/uploads/resumable-uploads
