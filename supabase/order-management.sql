-- Eleos Decor order-management upgrade
-- Run this in Supabase SQL Editor before using the new checkout/order dashboard.

alter table checkout_inquiries
  add column if not exists order_number text,
  add column if not exists customer_address text,
  add column if not exists order_note text,
  add column if not exists updated_at timestamptz default now();

-- Backfill old inquiries with readable order IDs.
update checkout_inquiries
set order_number = 'ELEOS-' || id::text
where order_number is null;

alter table checkout_inquiries
  alter column order_number set not null;

create unique index if not exists checkout_inquiries_order_number_key
  on checkout_inquiries(order_number);

-- Keep order statuses canonical and display them with labels in the app.
alter table checkout_inquiries
  drop constraint if exists checkout_inquiries_status_check;

update checkout_inquiries
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

alter table checkout_inquiries
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

create index if not exists checkout_inquiries_user_id_idx
  on checkout_inquiries(user_id);

create index if not exists checkout_inquiries_status_idx
  on checkout_inquiries(status);

create index if not exists checkout_inquiries_created_at_idx
  on checkout_inquiries(created_at desc);
