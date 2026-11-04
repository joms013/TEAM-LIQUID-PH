-- 007_price_as_of_date.sql
-- S2-DBA-02: Price as of date

create or replace function public.price_as_of_date(
    p_prodcode text,
    p_as_of_date date default current_date
)
returns numeric
language sql
stable
as $$
    select ph.unitprice
    from public.pricehist ph
    where ph.prodcode = p_prodcode
      and ph.effdate <= p_as_of_date
      and not ph.is_deleted
    order by ph.effdate desc  
    limit 1;
$$;

create or replace view public.product_price_as_of_date as
select
    p.prodcode,
    p.description,
    p.unit,
    public.price_as_of_date(p.prodcode, current_date) as price_as_of_date,
    current_date as as_of_date
from public.product_active p;

alter view public.product_price_as_of_date set (security_invoker = true);

create index if not exists pricehist_prodcode_effdate_idx
    on public.pricehist (prodcode, effdate desc);

comment on function public.price_as_of_date(text, date) is
    'Returns the most recent product price effective on or before the requested date.';

comment on view public.product_price_as_of_date is
    'Current product price snapshot using the effective price as of today.';