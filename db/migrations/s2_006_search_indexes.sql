create extension if not exists pg_trgm with schema extensions;

create index if not exists customer_custname_trgm_idx
    on public.customer using gin (custname extensions.gin_trgm_ops)
    where not is_deleted;

create index if not exists product_description_trgm_idx
    on public.product using gin (description extensions.gin_trgm_ops)
    where not is_deleted;

comment on index public.customer_custname_trgm_idx
    is 'Speeds up ILIKE %term% search on active customers.';
comment on index public.product_description_trgm_idx
    is 'Speeds up ILIKE %term% search on active products.';