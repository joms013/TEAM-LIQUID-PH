


insert into customer (custno, custname, address, payterm) values
  ('C9001', 'Demo Active Cust',  '1 Demo Street, Quezon City', '30D'),
  ('C9002', 'Demo Cash Cust',    '2 Demo Avenue, Manila',      'COD'),
  ('C9003', 'Demo Deleted Cust', '3 Demo Road, Makati',        '45D')
on conflict (custno) do nothing;

insert into product (prodcode, description, unit) values
  ('DM0001', 'Demo Widget A',        'pc'),
  ('DM0002', 'Demo Bracket Heavy',   'ea'),
  ('DM0003', 'Demo No-Price Item',   'pkg'),
  ('DM0004', 'Demo Deleted Product', 'pc')
on conflict (prodcode) do nothing;

insert into pricehist (effdate, prodcode, unitprice) values
  ('2026-01-01', 'DM0001', 12.00),
  ('2026-06-01', 'DM0001', 13.75),
  ('2027-01-01', 'DM0001', 15.00),   -- future price: must not be the current price
  ('2026-02-01', 'DM0002', 48.50)
on conflict (effdate, prodcode) do nothing;

-- Soft delete (no sales or prices point at these, so the child checks allow it).
update customer set is_deleted = true where custno = 'C9003' and not is_deleted;
update product  set is_deleted = true where prodcode = 'DM0004' and not is_deleted;