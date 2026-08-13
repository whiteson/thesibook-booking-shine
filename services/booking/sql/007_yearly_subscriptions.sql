-- Yearly auto-renew billing (PayPal Subscriptions + Viva recurring)
USE thesibook_control;

UPDATE cp_plans SET price_eur = 84.00 WHERE id = 'small';
UPDATE cp_plans SET price_eur = 180.00 WHERE id = 'unlimited';

ALTER TABLE cp_billing_orders
  MODIFY COLUMN payment_provider VARCHAR(16) NOT NULL DEFAULT 'paypal';

ALTER TABLE cp_billing_orders
  ADD COLUMN billing_interval VARCHAR(16) NOT NULL DEFAULT 'year' AFTER amount_cents;

ALTER TABLE cp_billing_orders
  ADD COLUMN is_renewal TINYINT(1) NOT NULL DEFAULT 0 AFTER billing_interval;

ALTER TABLE cp_billing_orders
  ADD COLUMN paypal_subscription_id VARCHAR(64) NULL AFTER paypal_capture_id;

ALTER TABLE cp_billing_orders
  ADD COLUMN viva_order_code VARCHAR(32) NULL AFTER paypal_subscription_id;

ALTER TABLE cp_billing_orders
  ADD COLUMN viva_transaction_id VARCHAR(64) NULL AFTER viva_order_code;

ALTER TABLE cp_workspaces
  ADD COLUMN billing_provider VARCHAR(16) NULL AFTER plan_expires_at;

CREATE TABLE IF NOT EXISTS cp_paypal_catalog (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  paypal_id VARCHAR(64) NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cp_subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  workspace_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  plan_id ENUM('small','unlimited') NOT NULL,
  provider VARCHAR(16) NOT NULL,
  status ENUM('active','cancelled','past_due','paused') NOT NULL DEFAULT 'active',
  paypal_subscription_id VARCHAR(64) NULL,
  viva_parent_transaction_id VARCHAR(64) NULL,
  viva_order_code VARCHAR(32) NULL,
  current_period_end TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cp_sub_paypal (paypal_subscription_id),
  KEY idx_cp_sub_workspace (workspace_id),
  KEY idx_cp_sub_viva (viva_parent_transaction_id),
  KEY idx_cp_sub_status_end (status, current_period_end),
  CONSTRAINT fk_cp_sub_workspace FOREIGN KEY (workspace_id) REFERENCES cp_workspaces (id),
  CONSTRAINT fk_cp_sub_user FOREIGN KEY (user_id) REFERENCES cp_users (id)
) ENGINE=InnoDB;
