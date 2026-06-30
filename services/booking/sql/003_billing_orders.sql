-- Billing orders (PayPal Checkout)
USE thesibook_control;

CREATE TABLE IF NOT EXISTS cp_billing_orders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  workspace_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  plan_id ENUM('small','unlimited') NOT NULL,
  amount_cents INT UNSIGNED NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'EUR',
  payment_provider ENUM('paypal') NOT NULL DEFAULT 'paypal',
  status ENUM('pending','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
  merchant_trns VARCHAR(128) NOT NULL,
  paypal_order_id VARCHAR(64) NULL,
  paypal_capture_id VARCHAR(64) NULL,
  payer_email VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cp_billing_merchant_trns (merchant_trns),
  KEY idx_cp_billing_workspace (workspace_id),
  KEY idx_cp_billing_paypal_order (paypal_order_id),
  CONSTRAINT fk_cp_billing_workspace FOREIGN KEY (workspace_id) REFERENCES cp_workspaces (id),
  CONSTRAINT fk_cp_billing_user FOREIGN KEY (user_id) REFERENCES cp_users (id)
) ENGINE=InnoDB;

ALTER TABLE cp_workspaces
  ADD COLUMN plan_expires_at TIMESTAMP NULL DEFAULT NULL AFTER attendant_count;
