-- Review docs/admin-access-rollout.md before applying to production.
-- No user roles or application data are changed by this migration.
begin;

-- Fail closed rather than lock every legitimate admin out during rollout.
do $$
begin
  if not exists (select 1 from auth.users where raw_app_meta_data->>'role' = 'admin'
      and email_confirmed_at is not null and deleted_at is null) then
    raise exception 'Enroll and verify at least one confirmed admin in app_metadata before applying.';
  end if;
end $$;

create or replace function public.is_admin() returns boolean
language sql stable security invoker set search_path = ''
as $$
  select (select auth.uid()) is not null
    and coalesce((select auth.jwt())->'app_metadata'->>'role' = 'admin', false);
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- Permissive policies combine with OR: remove every old policy on these tables.
-- Rebuild read, ownership and admin rules in the same transaction.
do $$
declare p record;
begin
  for p in select tablename,policyname from pg_policies
    where schemaname='public' and tablename in ('products','product_variants','checkout_inquiries')
  loop
    execute format('drop policy %I on public.%I',p.policyname,p.tablename);
  end loop;
end $$;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.checkout_inquiries enable row level security;
alter table public.checkout_inquiries alter column status set default 'new';
revoke all on public.products, public.product_variants, public.checkout_inquiries
  from public, anon, authenticated;
grant select on public.products, public.product_variants to anon, authenticated;
grant insert,update,delete on public.products, public.product_variants to authenticated;
grant insert on public.checkout_inquiries to anon, authenticated;
grant select,update on public.checkout_inquiries to authenticated;
grant all on public.products, public.product_variants, public.checkout_inquiries to service_role;

-- Preserve identity inserts for the allowed creation paths.
do $$
declare t text; s text;
begin
  foreach t in array array['products','checkout_inquiries'] loop
    s := pg_get_serial_sequence('public.' || t, 'id');
    if s is not null then
      execute format('grant usage,select on sequence %s to anon,authenticated,service_role',s);
    end if;
  end loop;
end $$;

create policy catalog_read on public.products for select to anon,authenticated using (true);
create policy variants_read on public.product_variants for select to anon,authenticated using (true);
do $$
declare t text;
begin
  foreach t in array array['products','product_variants'] loop
    execute format('create policy admin_insert on public.%I for insert to authenticated with check ((select public.is_admin()))',t);
    execute format('create policy admin_update on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))',t);
    execute format('create policy admin_delete on public.%I for delete to authenticated using ((select public.is_admin()))',t);
  end loop;
end $$;

create policy guest_inquiry on public.checkout_inquiries for insert to anon
  with check (user_id is null and status='new');
create policy customer_inquiry on public.checkout_inquiries for insert to authenticated
  with check ((select auth.uid())=user_id and status='new');
create policy inquiry_read on public.checkout_inquiries for select to authenticated
  using ((select auth.uid())=user_id or (select public.is_admin()));
create policy inquiry_admin_update on public.checkout_inquiries for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Remove the known legacy product storage policies and previous test policies.
-- Unrelated buckets' policies are preserved.
drop policy if exists "Allow authenticated users to upload product images" on storage.objects;
drop policy if exists "Allow authenticated users to delete product images" on storage.objects;
drop policy if exists test_products_admin_select on storage.objects;
drop policy if exists test_products_admin_insert on storage.objects;
drop policy if exists test_products_admin_update on storage.objects;
drop policy if exists test_products_admin_delete on storage.objects;
drop policy if exists products_admin_select on storage.objects;
drop policy if exists products_admin_insert on storage.objects;
drop policy if exists products_admin_update on storage.objects;
drop policy if exists products_admin_delete on storage.objects;
drop policy if exists products_write_guard_insert on storage.objects;
drop policy if exists products_write_guard_update on storage.objects;
drop policy if exists products_write_guard_delete on storage.objects;
create policy products_admin_select on storage.objects for select to authenticated
  using (bucket_id='products' and (select public.is_admin()));
create policy products_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id='products' and (select public.is_admin()));
create policy products_admin_update on storage.objects for update to authenticated
  using (bucket_id='products' and (select public.is_admin()))
  with check (bucket_id='products' and (select public.is_admin()));
create policy products_admin_delete on storage.objects for delete to authenticated
  using (bucket_id='products' and (select public.is_admin()));
-- A future or bucket-agnostic permissive policy must not reopen product writes.
create policy products_write_guard_insert on storage.objects as restrictive for insert to anon,authenticated
  with check (bucket_id<>'products' or (select public.is_admin()));
create policy products_write_guard_update on storage.objects as restrictive for update to anon,authenticated
  using (bucket_id<>'products' or (select public.is_admin()))
  with check (bucket_id<>'products' or (select public.is_admin()));
create policy products_write_guard_delete on storage.objects as restrictive for delete to anon,authenticated
  using (bucket_id<>'products' or (select public.is_admin()));

-- Keep analytics invoker-scoped; it must never bypass the inquiry policies.
alter function public.get_admin_analytics() security invoker;
alter function public.get_admin_analytics() set search_path = public;
revoke all on function public.get_admin_analytics() from public,anon;
grant execute on function public.get_admin_analytics() to authenticated,service_role;
commit;
