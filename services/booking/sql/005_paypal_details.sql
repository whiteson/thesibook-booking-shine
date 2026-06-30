-- PayPal capture audit fields (safe to re-run — ignore duplicate column errors)
USE thesibook_control;

ALTER TABLE cp_billing_orders
  ADD COLUMN paypal_capture_id VARCHAR(64) NULL AFTER paypal_order_id;

ALTER TABLE cp_billing_orders
  ADD COLUMN payer_email VARCHAR(255) NULL AFTER paypal_capture_id;
