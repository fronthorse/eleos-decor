-- TEST ONLY: eleos-decor-test (ztpvxikmatppyhoooyam).
-- Synthetic catalog only. No real reviews, customers, orders or emails.
begin;
do $$
begin
  if to_regprocedure('public.is_test_admin()') is null then
    raise exception 'STOP: verify you selected eleos-decor-test.';
  end if;
end $$;

insert into public.products (title, category, price, description, image_url, sku)
select v.title, v.category, v.price, v.description, '/placeholder-product.svg', v.sku
from (values
  ('TEST ONLY - Side Table', 'Tables', '15,000',
   'Synthetic test product for cart checks. Not available for purchase.', 'ELEOS-TEST-TABLE'),
  ('TEST ONLY - Wall Mirror', 'Mirrors', '10,000',
   'Synthetic test product for wishlist and category checks. Not available for purchase.', 'ELEOS-TEST-MIRROR'),
  ('TEST ONLY - Wall Frame', 'Frames', '5,000',
   'Synthetic test frame with two print choices. Not available for purchase.', 'ELEOS-TEST-FRAME')
) as v(title, category, price, description, sku)
where not exists (select 1 from public.products p where p.sku = v.sku);

insert into public.product_variants
  (product_id, variant_label, image_url, price_override, is_default, sku)
select p.id, v.label, '/placeholder-product.svg', v.price, v.is_default, v.sku
from public.products p
cross join (values
  ('Print A', null::text, true, 'ELEOS-TEST-PRINT-A'),
  ('Print B', '6,000', false, 'ELEOS-TEST-PRINT-B')
) as v(label, price, is_default, sku)
where p.sku = 'ELEOS-TEST-FRAME'
and not exists (
  select 1 from public.product_variants pv
  where pv.product_id = p.id and pv.variant_label = v.label
);
commit;

select
  (select count(*) from public.products
   where sku in ('ELEOS-TEST-TABLE','ELEOS-TEST-MIRROR','ELEOS-TEST-FRAME')) as test_products,
  (select count(*) from public.product_variants
   where sku in ('ELEOS-TEST-PRINT-A','ELEOS-TEST-PRINT-B')) as test_print_variants;
