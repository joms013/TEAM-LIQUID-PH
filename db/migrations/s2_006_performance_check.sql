
BEGIN;

SET LOCAL app.username = 'search_perf_check';

INSERT INTO public.customer (custno, custname, address, payterm)
SELECT 'y' || lpad(to_hex(g), 4, '0'),
       'Perf ' || left(md5(g::text), 12),
       'Perf fixture',
       'COD'
FROM generate_series(1, 20000) AS g;

INSERT INTO public.product (prodcode, description, unit)
SELECT 'Y' || lpad(g::text, 5, '0'),
       'Perf ' || left(md5(g::text), 12),
       'ea'
FROM generate_series(1, 20000) AS g;

ANALYZE public.customer;
ANALYZE public.product;

EXPLAIN (ANALYZE, BUFFERS)
SELECT custno, custname
FROM public.customer
WHERE custname ILIKE '%' || left(md5('777'), 12) || '%'
  AND NOT is_deleted;



ROLLBACK;