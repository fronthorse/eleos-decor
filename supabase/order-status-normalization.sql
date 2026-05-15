-- Normalize existing checkout inquiry statuses to canonical SQL-style values.
-- Safe to run multiple times. Does not delete or recreate inquiries.

alter table public.checkout_inquiries
  drop constraint if exists checkout_inquiries_status_check;

update public.checkout_inquiries
set status = case status
  when 'New' then 'new'
  when 'pending' then 'new'
  when 'Contacted' then 'contacted'
  when 'Payment Pending' then 'payment_pending'
  when 'Paid' then 'paid'
  when 'payment_confirmed' then 'paid'
  when 'Processing' then 'processing'
  when 'Delivered' then 'delivered'
  when 'fulfilled' then 'delivered'
  when 'Cancelled' then 'cancelled'
  else status
end
where status in (
  'New',
  'pending',
  'Contacted',
  'Payment Pending',
  'Paid',
  'payment_confirmed',
  'Processing',
  'Delivered',
  'fulfilled',
  'Cancelled'
);

alter table public.checkout_inquiries
  add constraint checkout_inquiries_status_check
  check (
    status in (
      'new',
      'contacted',
      'payment_pending',
      'paid',
      'processing',
      'delivered',
      'cancelled'
    )
  );

create index if not exists checkout_inquiries_status_idx
  on public.checkout_inquiries(status);
