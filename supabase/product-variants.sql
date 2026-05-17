create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id bigint not null references public.products(id) on delete cascade,
  variant_label text not null,
  variant_type text not null default 'print',
  image_url text not null,
  gallery jsonb not null default '[]'::jsonb,
  price_override text,
  sku text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx
  on public.product_variants(product_id);

create index if not exists product_variants_product_default_idx
  on public.product_variants(product_id, is_default);

alter table public.product_variants enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'product_variants'
      and policyname = 'Public can read product variants'
  ) then
    create policy "Public can read product variants"
      on public.product_variants
      for select
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'product_variants'
      and policyname = 'Authenticated users can manage product variants'
  ) then
    create policy "Authenticated users can manage product variants"
      on public.product_variants
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;
