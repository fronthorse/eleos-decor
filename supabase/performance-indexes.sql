-- Eleos Decor performance indexes
-- Run in Supabase SQL Editor to prepare for larger product catalogs and traffic.

-- Helps ILIKE searches used by the shop page and AI assistant.
create extension if not exists pg_trgm;

-- Products: shop filtering, pagination, sorting, product detail related items,
-- and product availability search.
create index if not exists products_category_idx
  on public.products(category);

create index if not exists products_created_at_idx
  on public.products(created_at desc);

create index if not exists products_price_idx
  on public.products(price);

create index if not exists products_title_trgm_idx
  on public.products
  using gin (title gin_trgm_ops);

create index if not exists products_category_trgm_idx
  on public.products
  using gin (category gin_trgm_ops);

create index if not exists products_description_trgm_idx
  on public.products
  using gin (description gin_trgm_ops);

-- Reviews: product detail page loads reviews by product and newest first.
create index if not exists reviews_product_id_idx
  on public.reviews(product_id);

create index if not exists reviews_product_id_created_at_idx
  on public.reviews(product_id, created_at desc);

-- Wishlist: wishlist loads by user and toggles by user/product pair.
create index if not exists wishlist_items_user_id_idx
  on public.wishlist_items(user_id);

create index if not exists wishlist_items_product_id_idx
  on public.wishlist_items(product_id);

create index if not exists wishlist_items_user_product_idx
  on public.wishlist_items(user_id, product_id);

-- Checkout inquiries: customer dashboard, admin order list, and customer lookup.
-- Some of these may already exist from order-management.sql; IF NOT EXISTS keeps this safe.
create index if not exists checkout_inquiries_user_id_idx
  on public.checkout_inquiries(user_id);

create index if not exists checkout_inquiries_customer_email_idx
  on public.checkout_inquiries(customer_email);

create index if not exists checkout_inquiries_created_at_idx
  on public.checkout_inquiries(created_at desc);

create index if not exists checkout_inquiries_status_idx
  on public.checkout_inquiries(status);

-- AI chat sessions: one active session per user already creates a unique user_id index.
-- updated_at supports loading the latest session quickly.
create index if not exists ai_chat_sessions_updated_at_idx
  on public.ai_chat_sessions(updated_at desc);

-- Future recommendation, not forced here:
-- For larger catalogs, consider adding a generated/search_vector column on products
-- and a GIN full-text search index for title + category + description.
