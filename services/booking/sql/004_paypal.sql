-- Legacy PayPal column migration (old installs before 003_billing_orders)
-- Safe to re-run — ignore duplicate column errors
USE thesibook_control;

ALTER TABLE cp_billing_orders
  ADD COLUMN payment_provider ENUM('paypal') NOT NULL DEFAULT 'paypal' AFTER currency;

ALTER TABLE cp_billing_orders
  ADD COLUMN paypal_order_id VARCHAR(64) NULL AFTER merchant_trns;

ALTER TABLE cp_billing_orders
  ADD KEY idx_cp_billing_paypal_order (paypal_order_id);
