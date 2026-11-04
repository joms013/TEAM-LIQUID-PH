-- S2-DBA-04: verify child-record delete checks for customer and product
-- Run against a database with db/migrations applied, using the Supabase SQL
-- Editor or psql as a role that can write to these tables. All fixtures roll
-- back when the script completes.
BEGIN;

SET LOCAL app.username = 'delete_check_test';

INSERT INTO employee (empno) VALUES ('ZZ901');
INSERT INTO customer (custno, custname, address, payterm)
VALUES ('ZZ901', 'Delete check', 'Test fixture', 'COD');
INSERT INTO sales (transno, salesdate, custno, empno)
VALUES ('ZZ900001', CURRENT_DATE, 'ZZ901', 'ZZ901');

INSERT INTO product (prodcode, description, unit)
VALUES ('ZZ9001', 'Delete check detail', 'ea'),
       ('ZZ9002', 'Delete check price', 'ea');
INSERT INTO salesdetail (transno, prodcode, quantity)
VALUES ('ZZ900001', 'ZZ9001', 1);
INSERT INTO pricehist (effdate, prodcode, unitprice)
VALUES (CURRENT_DATE, 'ZZ9002', 1);

DO $$
DECLARE
  v_blocked boolean;
BEGIN
  -- 1. Hard deletes of parents with child records must be blocked
  v_blocked := false;
  BEGIN
    DELETE FROM customer WHERE custno = 'ZZ901';
  EXCEPTION WHEN OTHERS THEN
    v_blocked := true;
  END;
  IF NOT v_blocked THEN
    RAISE EXCEPTION 'FAIL: customer with a sales record was hard-deleted';
  END IF;
  RAISE NOTICE 'PASS: customer hard delete is blocked';

  v_blocked := false;
  BEGIN
    DELETE FROM product WHERE prodcode = 'ZZ9001';
  EXCEPTION WHEN OTHERS THEN
    v_blocked := true;
  END;
  IF NOT v_blocked THEN
    RAISE EXCEPTION 'FAIL: product with a sales detail was hard-deleted';
  END IF;
  RAISE NOTICE 'PASS: product (sales detail) hard delete is blocked';

  v_blocked := false;
  BEGIN
    DELETE FROM product WHERE prodcode = 'ZZ9002';
  EXCEPTION WHEN OTHERS THEN
    v_blocked := true;
  END;
  IF NOT v_blocked THEN
    RAISE EXCEPTION 'FAIL: product with a price history was hard-deleted';
  END IF;
  RAISE NOTICE 'PASS: product (price history) hard delete is blocked';

  -- 2. Parents and children must still exist
  IF NOT EXISTS (SELECT 1 FROM customer WHERE custno = 'ZZ901')
     OR NOT EXISTS (SELECT 1 FROM sales WHERE transno = 'ZZ900001')
     OR (SELECT count(*) FROM product WHERE prodcode IN ('ZZ9001', 'ZZ9002')) <> 2
     OR NOT EXISTS (SELECT 1 FROM salesdetail WHERE transno = 'ZZ900001' AND prodcode = 'ZZ9001')
     OR NOT EXISTS (SELECT 1 FROM pricehist WHERE prodcode = 'ZZ9002' AND effdate = CURRENT_DATE) THEN
    RAISE EXCEPTION 'FAIL: a parent or child fixture was unexpectedly removed';
  END IF;

  -- 3. Soft delete of a parent that still has children (reported, not enforced)
  v_blocked := false;
  BEGIN
    UPDATE customer SET is_deleted = true WHERE custno = 'ZZ901';
  EXCEPTION WHEN OTHERS THEN
    v_blocked := true;
  END;
  IF v_blocked THEN
    RAISE NOTICE 'INFO: soft delete of a customer with sales is blocked';
  ELSE
    RAISE NOTICE 'INFO: soft delete of a customer with sales is allowed';
  END IF;

  v_blocked := false;
  BEGIN
    UPDATE product SET is_deleted = true WHERE prodcode = 'ZZ9001';
  EXCEPTION WHEN OTHERS THEN
    v_blocked := true;
  END;
  IF v_blocked THEN
    RAISE NOTICE 'INFO: soft delete of a product with sales detail is blocked';
  ELSE
    RAISE NOTICE 'INFO: soft delete of a product with sales detail is allowed';
  END IF;
END;
$$;

ROLLBACK;