-- Run only in eleos-decor-test.
begin;
do $$
begin
  if to_regprocedure('public.is_test_admin()') is null then
    raise exception 'Test admin helper missing: verify you selected eleos-decor-test.';
  end if;
  if not exists (select 1 from storage.buckets where id = 'products') then
    raise exception 'The products bucket is missing.';
  end if;
end $$;

create policy test_products_admin_select
on storage.objects for select to authenticated
using (bucket_id = 'products' and (select public.is_test_admin()));

create policy test_products_admin_insert
on storage.objects for insert to authenticated
with check (bucket_id = 'products' and (select public.is_test_admin()));

create policy test_products_admin_update
on storage.objects for update to authenticated
using (bucket_id = 'products' and (select public.is_test_admin()))
with check (bucket_id = 'products' and (select public.is_test_admin()));

create policy test_products_admin_delete
on storage.objects for delete to authenticated
using (bucket_id = 'products' and (select public.is_test_admin()));

commit;
select 'Four admin-only image policies created.' as result;

