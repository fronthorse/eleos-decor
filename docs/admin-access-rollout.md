# Admin access rollout

Status: prepared and tested on eleos-decor-test only. Production has not changed.
Do not merge/deploy production or apply production SQL without the owner's approval.

## What changes

The migration 20261102152109_harden_admin_access.sql replaces all policies on
products, product_variants and checkout_inquiries in one transaction. Catalog reads
stay public. Catalog writes and inquiry updates require app_metadata.role = admin.
Customers can read only their own inquiries and create only new inquiries with
their own user_id. Guests can create new inquiries with no user_id and cannot read
customer inquiries. Product image writes require the trusted admin role; restrictive
storage policies prevent a broader permissive policy from reopening that bucket.
Other buckets' policies and the catalog's public image delivery are preserved.

The API verifies the bearer token using Auth getUser, then requires BOTH the trusted
app_metadata admin role and the deployment's NEXT_PUBLIC_ADMIN_EMAILS allowlist
before creating the privileged service client. Browser admin routing uses the same
predicate; browser state is not the security boundary. Never assign admin status
through editable user_metadata or a public profile field.

## Production preflight and ordered rollout

1. Confirm the intended existing production admin login with the owner. Verify the
   Auth user exists, has a confirmed email and is included in Production's existing
   NEXT_PUBLIC_ADMIN_EMAILS setting. Do not copy production secrets into Preview.
2. Back up the current policy/grant definitions and review the migration diff.
   Existing production data must not be copied into the test project.
3. With separate approval, enroll only that confirmed production Auth user by setting
   app_metadata.role to admin through the trusted Auth Admin API or reviewed SQL.
   Preserve other app_metadata keys. Do not change the user's top-level Postgres
   role, password, email, user_metadata, or any customer account. Production currently
   has zero confirmed users with app_metadata.role = admin. The migration refuses
   to proceed until at least one exists, to prevent an admin lockout.
4. Log out/in to obtain a fresh admin JWT and verify its app_metadata role. JWT claims
   can remain stale until refresh. Removing a role does not revoke an issued token;
   revoke refresh sessions and account for access-token expiry during offboarding.
5. Apply the reviewed migration to the production project in one transaction during
   an approved rollout. It makes no product/order/customer-row changes. Verify public
   reads, customer ownership boundaries and admin access before deploying app changes.
   The current app's email checks remain compatible with newly enrolled admins.
6. Only after explicit release approval, merge/deploy the app changes. Verify public
   shop, real admin login and read access. Do not send emails, place orders or modify
   production products as smoke tests without separate approval.

This repository does not contain a complete baseline migration history. Do not run
an unreviewed db push against production or apply this incremental migration to an
empty database. The test bootstrap is a separate, synthetic environment setup.

## Verification evidence

- Migration applied only to isolated project ztpvxikmatppyhoooyam via MCP.
- supabase/tests/admin-access.sql passed both with the migration in a rolled-back
  transaction and after its application. All fixtures are rolled back. It exercises
  the database roles/JWT claims used by PostgREST, not signed HTTP login tokens.
- Guest/customer catalog writes denied, trusted admin product and variant writes
  allowed, customer inquiry ownership/status spoofing denied, guest inquiry reads
  denied, legitimate guest/customer creation and admin inquiry updates allowed.
- User-editable metadata containing role=admin cannot grant privileges.
- Storage metadata insert/update tests passed even with an intentionally broad
  permissive policy present in the test transaction. Supabase prohibits direct SQL
  storage deletes; the protection was not disabled. Storage API deletion and actual
  browser flows must be checked on Preview with the test accounts.
- scripts/verify-admin-access.mjs checks API denial of absent/invalid tokens,
  email-only admins, editable-metadata spoofing and non-allowlisted admin roles.
  Denied users cannot instantiate the privileged client. Real Auth calls are mocked
  in this script; it requires no secrets and does not replace HTTP integration checks.
- Lint and production build passed. Eight existing lint warnings remain.
- Supabase's test-project security advisor has no database findings. It reports
  leaked-password protection disabled; consider enabling it independently:
  https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Recovery

Before commit, any SQL error rolls back the transaction, preserving the previous
policies. After commit, prefer forward repair: verify the approved admin's trusted
role, refresh their session and check the email allowlist. Use SQL Editor/service
access for recovery; don't restore unconditional authenticated policies to recover
an admin login. If another application needs access, add a reviewed narrow policy.
The migration can be rerun: it replaces its own policies and the legacy policies.

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security
