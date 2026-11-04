 alter view customer_active set (security_invoker = true);
   alter view product_active  set (security_invoker = true);

   create index if not exists sales_custno_idx      on sales (custno);
   create index if not exists sales_empno_idx       on sales (empno);
   create index if not exists salesdetail_prodcode_idx on salesdetail (prodcode);
   create index if not exists pricehist_prodcode_idx   on pricehist (prodcode);
   create index if not exists customer_custname_idx on customer (custname) where not is_deleted;
   create index if not exists product_description_idx on product (description) where not is_deleted;