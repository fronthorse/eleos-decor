-- Template only. Do not run until the owner approves production enrollment.
-- Set the email only after confirming the target project and the Vercel allowlist.
-- Example: select set_config('app.approved_admin_email','THE_VERIFIED_EMAIL',false);
begin;
do $$
declare approved_email text; affected integer;
begin
  approved_email := nullif(current_setting('app.approved_admin_email',true),'');
  if approved_email is null then raise exception 'Set app.approved_admin_email to the owner-approved login first'; end if;
  update auth.users
  set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb) || '{"role":"admin"}'::jsonb
  where lower(email)=lower(approved_email) and email_confirmed_at is not null and deleted_at is null;
  get diagnostics affected=row_count;
  if affected<>1 then raise exception 'Expected exactly one active confirmed user; enrollment rolled back'; end if;
end $$;
commit;
