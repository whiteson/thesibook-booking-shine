-- Platform password reset tokens (hashed, single-use). Not Easy!Appointments users.
USE thesibook_control;

CREATE TABLE IF NOT EXISTS cp_password_resets (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cp_password_resets_user (user_id),
  KEY idx_cp_password_resets_hash (token_hash),
  CONSTRAINT fk_cp_password_resets_user FOREIGN KEY (user_id) REFERENCES cp_users (id) ON DELETE CASCADE
) ENGINE=InnoDB;
