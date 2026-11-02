-- Run only on the isolated test project after the migration. Always rolls back.
-- Simulates PostgREST's authenticated/anon DB roles and verified JWT claims;
-- does not validate token signing or run HTTP login flows.
begin;
do $$
begin
  if to_regprocedure('public.is_test_admin()') is null then
    raise exception 'Run this test suite only on the isolated test project';
  end if;
end $$;
create temporary table security_fixture (product_id bigint, customer_id uuid, admin_id uuid, storage_id uuid);
insert into security_fixture(customer_id,admin_id)
select c.id,a.id from auth.users c cross join auth.users a
where c.email='customer-test@example.com' and a.email='admin-test@example.com';
do $$ begin
  if (select count(*) from security_fixture)<>1 then raise exception 'Test accounts missing'; end if;
end $$;
with p as (insert into public.products(title,category,price) values ('RLS TEST fixture','Tables','1') returning id)
update security_fixture set product_id=(select id from p);
insert into public.product_variants(product_id,variant_label,image_url)
select product_id,'RLS TEST','/placeholder-product.svg' from security_fixture;
insert into public.checkout_inquiries(user_id,order_number,status)
select customer_id,'RLS-TEST-OWNER','new' from security_fixture
union all select admin_id,'RLS-TEST-OTHER','new' from security_fixture;
with o as (insert into storage.objects(bucket_id,name) values ('products','__rls_fixture__') returning id)
update security_fixture set storage_id=(select id from o);
-- Prove restrictive product guards survive a bucket-agnostic permissive policy.
create policy security_test_broad_storage on storage.objects for all to anon,authenticated using (true) with check (true);
grant select on security_fixture to authenticated,anon;

select set_config('request.jwt.claims',json_build_object(
 'sub',customer_id,'role','authenticated','app_metadata',json_build_object(),
 'user_metadata',json_build_object('role','admin'))::text,true) from security_fixture;
set local role authenticated;
do $$
declare n integer;
begin
  if public.is_admin() then raise exception 'User-editable metadata escalated privileges'; end if;
  update storage.objects set name='__denied__' where id=(select storage_id from security_fixture);
  get diagnostics n=row_count;
  if n<>0 then raise exception 'Customer changed product image'; end if;

  begin
    insert into storage.objects(bucket_id,name) values ('products','__denied_customer__');
    raise exception 'Customer uploaded product image';
  exception when insufficient_privilege then null; end;
  select count(*) into n from public.checkout_inquiries where order_number like 'RLS-TEST-%';
  if n<>1 then raise exception 'Customer inquiry isolation failed'; end if;
  update public.checkout_inquiries set status='paid' where order_number like 'RLS-TEST-%';
  get diagnostics n=row_count;
  if n<>0 then raise exception 'Customer changed inquiry status'; end if;
  update public.products set title='DENIED' where id=(select product_id from security_fixture);
  get diagnostics n=row_count;
  if n<>0 then raise exception 'Customer changed product'; end if;
  delete from public.products where id=(select product_id from security_fixture);
  get diagnostics n=row_count;
  if n<>0 then raise exception 'Customer deleted product'; end if;
  update public.product_variants set variant_label='DENIED' where product_id=(select product_id from security_fixture);
  get diagnostics n=row_count;
  if n<>0 then raise exception 'Customer changed variant'; end if;
  delete from public.product_variants where product_id=(select product_id from security_fixture);
  get diagnostics n=row_count;
  if n<>0 then raise exception 'Customer deleted variant'; end if;
  begin
    insert into public.products(title,category,price) values ('DENIED','Tables','1');
    raise exception 'Customer inserted product';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.product_variants(product_id,variant_label,image_url)
    select product_id,'DENIED','/placeholder-product.svg' from security_fixture;
    raise exception 'Customer inserted variant';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.checkout_inquiries(user_id,order_number,status)
    select admin_id,'RLS-TEST-SPOOF','new' from security_fixture;
    raise exception 'Customer spoofed inquiry owner';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.checkout_inquiries(user_id,order_number,status)
    select customer_id,'RLS-TEST-PAID','paid' from security_fixture;
    raise exception 'Customer inserted paid inquiry';
  exception when insufficient_privilege then null; end;
  insert into public.checkout_inquiries(user_id,order_number,status)
  select customer_id,'RLS-TEST-CREATE','new' from security_fixture;
end $$;
reset role;

select set_config('request.jwt.claims',json_build_object('sub',admin_id,
 'role','authenticated','app_metadata',json_build_object('role','admin'))::text,true) from security_fixture;
set local role authenticated;
do $$
declare n integer;
begin
  if not public.is_admin() then raise exception 'Admin role rejected'; end if;
  update storage.objects set name='__rls_fixture_updated__' where id=(select storage_id from security_fixture);
  get diagnostics n=row_count;
  if n<>1 then raise exception 'Admin image update denied'; end if;
  insert into storage.objects(bucket_id,name) values ('products','__rls_admin_insert__');

  select count(*) into n from public.checkout_inquiries where order_number like 'RLS-TEST-%';
  if n<>3 then raise exception 'Admin cannot read all inquiry fixtures'; end if;
  update public.checkout_inquiries set status='contacted' where order_number='RLS-TEST-OTHER';
  get diagnostics n=row_count;
  if n<>1 then raise exception 'Admin inquiry update denied'; end if;
  update public.products set title='RLS TEST updated' where id=(select product_id from security_fixture);
  get diagnostics n=row_count;
  if n<>1 then raise exception 'Admin product update denied'; end if;
  update public.product_variants set variant_label='RLS TEST updated' where product_id=(select product_id from security_fixture);
  get diagnostics n=row_count;
  if n<>1 then raise exception 'Admin variant update denied'; end if;
  insert into public.products(title,category,price) values ('RLS TEST admin insert','Tables','1');
  insert into public.product_variants(product_id,variant_label,image_url)
  select product_id,'RLS TEST admin insert','/placeholder-product.svg' from security_fixture;
  delete from public.product_variants where product_id=(select product_id from security_fixture);
  delete from public.products where id=(select product_id from security_fixture);
end $$;
reset role;
select set_config('request.jwt.claims','{}',true);
set local role anon;
do $$
declare n integer;
begin
  begin
    insert into storage.objects(bucket_id,name) values ('products','__denied_guest__');
    raise exception 'Guest uploaded product image';
  exception when insufficient_privilege then null; end;
  perform count(*) from public.products;
  perform count(*) from public.product_variants;
  begin
    perform count(*) from public.checkout_inquiries;
    raise exception 'Guest read private inquiries';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.products(title,category,price) values ('DENIED','Tables','1');
    raise exception 'Guest inserted product';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.checkout_inquiries(user_id,order_number,status)
    select customer_id,'RLS-TEST-GUEST-SPOOF','new' from security_fixture;
    raise exception 'Guest spoofed customer identity';
  exception when insufficient_privilege then null; end;
  insert into public.checkout_inquiries(order_number,status) values ('RLS-TEST-GUEST','new');
end $$;
reset role;
select 'PASS: guest/customer/admin catalog and inquiry RLS; spoofed metadata and ownership denied' as result;
rollback;
