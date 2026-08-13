-- Pre-provisioned MySQL databases (Hetzner panel pool — one tenant per DB)
USE thesibook_control;

CREATE TABLE IF NOT EXISTS cp_db_pool (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  db_host VARCHAR(255) NOT NULL,
  db_name VARCHAR(64) NOT NULL,
  db_user VARCHAR(64) NOT NULL,
  db_password_enc TEXT NOT NULL,
  status ENUM('available','assigned','disabled') NOT NULL DEFAULT 'available',
  workspace_id BIGINT UNSIGNED NULL DEFAULT NULL,
  assigned_at TIMESTAMP NULL DEFAULT NULL,
  last_error TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cp_db_pool_name (db_name),
  KEY idx_cp_db_pool_status (status),
  CONSTRAINT fk_cp_db_pool_workspace FOREIGN KEY (workspace_id) REFERENCES cp_workspaces (id)
) ENGINE=InnoDB;
