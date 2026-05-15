-- Optional admin analytics helper.
-- Run in Supabase SQL Editor to calculate dashboard metrics in one
-- database-side aggregate query instead of many client-side requests.

create or replace function public.get_admin_analytics()
returns table (
  total_products bigint,
  total_reviews bigint,
  average_rating numeric,
  total_inquiries bigint,
  pending_inquiries bigint,
  contacted_inquiries bigint,
  payment_pending_inquiries bigint,
  processing_inquiries bigint,
  confirmed_inquiries bigint,
  fulfilled_inquiries bigint,
  cancelled_inquiries bigint,
  estimated_revenue numeric
)
language sql
stable
as $$
  select
    (select count(*) from public.products) as total_products,
    (select count(*) from public.reviews) as total_reviews,
    coalesce((select round(avg(rating::numeric), 1) from public.reviews), 0) as average_rating,
    (select count(*) from public.checkout_inquiries) as total_inquiries,
    (
      select count(*) from public.checkout_inquiries
      where status = 'new'
    ) as pending_inquiries,
    (
      select count(*) from public.checkout_inquiries
      where status = 'contacted'
    ) as contacted_inquiries,
    (
      select count(*) from public.checkout_inquiries
      where status = 'payment_pending'
    ) as payment_pending_inquiries,
    (
      select count(*) from public.checkout_inquiries
      where status = 'processing'
    ) as processing_inquiries,
    (
      select count(*) from public.checkout_inquiries
      where status = 'paid'
    ) as confirmed_inquiries,
    (
      select count(*) from public.checkout_inquiries
      where status = 'delivered'
    ) as fulfilled_inquiries,
    (
      select count(*) from public.checkout_inquiries
      where status = 'cancelled'
    ) as cancelled_inquiries,
    coalesce(
      (
        select sum(total_amount::numeric)
        from public.checkout_inquiries
        where status = any(array['paid', 'processing', 'delivered'])
      ),
      0
    ) as estimated_revenue;
$$;
