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

-- Keep statuses flexible enough for old and new records.
alter table checkout_inquiries
  drop constraint if exists checkout_inquiries_status_check;

alter table checkout_inquiries
  add constraint checkout_inquiries_status_check
  check (
    status in (
      'new',
      'pending',
      'contacted',
      'payment_pending',
      'paid',
      'payment_confirmed',
      'processing',
      'delivered',
      'fulfilled',
      'cancelled'
    )
  );

update checkout_inquiries
set status = 'new'
where status = 'pending';

create index if not exists checkout_inquiries_user_id_idx
  on checkout_inquiries(user_id);

create index if not exists checkout_inquiries_status_idx
  on checkout_inquiries(status);

create index if not exists checkout_inquiries_created_at_idx
  on checkout_inquiries(created_at desc);
