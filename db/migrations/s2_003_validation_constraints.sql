-- S2-DBA-03: validation constraints for customer.payterm and product.unit

alter table public.customer
    drop constraint if exists customer_payterm_check;
alter table public.customer
    add constraint customer_payterm_check
    check (payterm is null or payterm in ('COD', '30D', '45D')) not valid;
alter table public.customer
    validate constraint customer_payterm_check;

alter table public.product
    drop constraint if exists product_unit_check;
alter table public.product
    add constraint product_unit_check
    check (unit is null or unit in ('pc', 'ea', 'mtr', 'pkg', 'ltr')) not valid;
alter table public.product
    validate constraint product_unit_check;

comment on constraint customer_payterm_check on public.customer
    is 'Allowed payment terms: COD, 30D, 45D.';
comment on constraint product_unit_check on public.product
    is 'Allowed units of measure.';
