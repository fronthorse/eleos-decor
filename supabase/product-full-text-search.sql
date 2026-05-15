-- Optional full-text product search upgrade.
-- Run this only when you are ready to move product search from trigram-backed
-- ILIKE filters to Postgres full-text search.

alter table public.products
add column if not exists search_vector tsvector
generated always as (
  setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(category, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'C')
) stored;

create index if not exists products_search_vector_idx
  on public.products
  using gin (search_vector);

-- Example query shape for a future RPC or server route:
-- select id, title, category, description, price, image_url, created_at
-- from public.products
-- where search_vector @@ websearch_to_tsquery('english', 'mirror wall art')
-- order by ts_rank(search_vector, websearch_to_tsquery('english', 'mirror wall art')) desc,
--          created_at desc
-- limit 12;

create or replace function public.search_products(
  p_search_query text default '',
  p_category text default null,
  p_sort text default 'relevance',
  p_limit integer default 12,
  p_offset integer default 0
)
returns table (
  id text,
  title text,
  description text,
  price text,
  image_url text,
  category text,
  created_at timestamptz,
  rank real,
  total_count bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  with search_input as (
    select
      nullif(trim(coalesce(p_search_query, '')), '') as query_text,
      nullif(trim(coalesce(p_category, '')), '') as category_filter,
      greatest(coalesce(p_limit, 12), 1) as limit_rows,
      greatest(coalesce(p_offset, 0), 0) as offset_rows
  ),
  matched_products as (
    select
      p.id::text,
      p.title::text,
      p.description::text,
      p.price::text,
      p.image_url::text,
      p.category::text,
      p.created_at,
      case
        when search_input.query_text is null then 0::real
        else ts_rank_cd(
          p.search_vector,
          websearch_to_tsquery('english', search_input.query_text)
        )
      end as rank,
      nullif(regexp_replace(p.price::text, '[^0-9.]', '', 'g'), '')::numeric
        as price_value
    from public.products p
    cross join search_input
    where (
      search_input.category_filter is null
      or search_input.category_filter = 'All'
      or p.category = search_input.category_filter
    )
    and (
      search_input.query_text is null
      or p.search_vector @@ websearch_to_tsquery('english', search_input.query_text)
    )
  ),
  counted_products as (
    select
      matched_products.*,
      count(*) over() as total_count
    from matched_products
  )
  select
    counted_products.id,
    counted_products.title,
    counted_products.description,
    counted_products.price,
    counted_products.image_url,
    counted_products.category,
    counted_products.created_at,
    counted_products.rank,
    counted_products.total_count
  from counted_products
  cross join search_input
  order by
    case when p_sort = 'price_low' then counted_products.price_value end asc nulls last,
    case when p_sort = 'price_high' then counted_products.price_value end desc nulls last,
    case when p_sort = 'oldest' then counted_products.created_at end asc,
    case when p_sort = 'newest' then counted_products.created_at end desc,
    counted_products.rank desc,
    counted_products.created_at desc
  limit (select limit_rows from search_input)
  offset (select offset_rows from search_input);
$$;
