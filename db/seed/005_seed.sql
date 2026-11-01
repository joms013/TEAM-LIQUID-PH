BEGIN;

-- 1) Seed roles
INSERT INTO role (name)
VALUES
  ('superadmin'),
  ('admin'),
  ('user')
ON CONFLICT (name) DO NOTHING;

-- 2) Seed modules
INSERT INTO module (name)
VALUES
  ('Customer Management'),
  ('Product Management'),
  ('Human Resources'),
  ('Sales Management'),
  ('Reports')
ON CONFLICT (name) DO NOTHING;

-- 3) Seed rights (36 total)
INSERT INTO app_right (module_id, code, description)
VALUES
  -- Customer Management (3)
  ((SELECT id FROM module WHERE name = 'Customer Management'), 'customer_add', 'Add Customer'),
  ((SELECT id FROM module WHERE name = 'Customer Management'), 'customer_edit', 'Edit Customer'),
  ((SELECT id FROM module WHERE name = 'Customer Management'), 'customer_delete', 'Delete Customer'), 

  -- Product Management (6)
  ((SELECT id FROM module WHERE name = 'Product Management'), 'product_add', 'Add Product'),
  ((SELECT id FROM module WHERE name = 'Product Management'), 'product_edit', 'Edit Product'),
  ((SELECT id FROM module WHERE name = 'Product Management'), 'product_delete', 'Delete Product'),
  ((SELECT id FROM module WHERE name = 'Product Management'), 'price_add', 'Add Price'),
  ((SELECT id FROM module WHERE name = 'Product Management'), 'price_edit', 'Edit Price'),
  ((SELECT id FROM module WHERE name = 'Product Management'), 'price_delete', 'Delete Price'),  

  -- Human Resources (13)
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'job_add', 'Add Job'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'job_edit', 'Edit Job'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'job_delete', 'Delete Job'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'department_add', 'Add Department'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'department_edit', 'Edit Department'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'department_delete', 'Delete Department'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'employee_add', 'Add Employee'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'employee_edit', 'Edit Employee'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'employee_delete', 'Delete Employee'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'job_history_view', 'View Job History'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'job_history_add', 'Add Job History'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'job_history_edit', 'Edit Job History'),
  ((SELECT id FROM module WHERE name = 'Human Resources'), 'job_history_delete', 'Delete Job History'), 

  -- Sales Management (7)
  ((SELECT id FROM module WHERE name = 'Sales Management'), 'sale_add', 'Add Sale'),
  ((SELECT id FROM module WHERE name = 'Sales Management'), 'sale_edit', 'Edit Sale'),
  ((SELECT id FROM module WHERE name = 'Sales Management'), 'sale_delete', 'Delete Sale'),
  ((SELECT id FROM module WHERE name = 'Sales Management'), 'sale_detail_view', 'View Sale Detail'),
  ((SELECT id FROM module WHERE name = 'Sales Management'), 'sale_detail_add', 'Add Sale Detail'),
  ((SELECT id FROM module WHERE name = 'Sales Management'), 'sale_detail_edit', 'Edit Sale Detail'),
  ((SELECT id FROM module WHERE name = 'Sales Management'), 'sale_detail_delete', 'Delete Sale Detail'),

  -- Reports (7)
  ((SELECT id FROM module WHERE name = 'Reports'), 'report_top_customers', 'Top Customers'),
  ((SELECT id FROM module WHERE name = 'Reports'), 'report_product_master_list', 'Product Master List'),
  ((SELECT id FROM module WHERE name = 'Reports'), 'report_top_products', 'Top Products'),
  ((SELECT id FROM module WHERE name = 'Reports'), 'report_active_employees', 'Active Employees'),
  ((SELECT id FROM module WHERE name = 'Reports'), 'report_all_employees', 'All Employees'),
  ((SELECT id FROM module WHERE name = 'Reports'), 'report_employee_job_history', 'Employee Job History'),
  ((SELECT id FROM module WHERE name = 'Reports'), 'report_top_sales', 'Top Sales')
ON CONFLICT (code) DO NOTHING;

-- 4) Grant all rights to superadmin and admin, leaving user with no seed rights.
INSERT INTO role_right (role_id, right_id)
SELECT r.id, ar.id
FROM role r
JOIN app_right ar ON true
WHERE r.name IN ('superadmin', 'admin')
ON CONFLICT (role_id, right_id) DO NOTHING;

COMMIT;
