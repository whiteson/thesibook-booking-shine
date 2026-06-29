-- ThesiBook control plane (NOT Easy!Appointments schema)
-- Run: mysql -u root -p < services/booking/sql/001_control_plane.sql

CREATE DATABASE IF NOT EXISTS thesibook_control
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE thesibook_control;

CREATE TABLE IF NOT EXISTS cp_users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cp_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cp_workspaces (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  slug VARCHAR(63) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  status ENUM('pending','provisioning','active','suspended','deleted') NOT NULL DEFAULT 'pending',
  owner_user_id BIGINT UNSIGNED NOT NULL,
  ea_base_url VARCHAR(512) NOT NULL DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cp_workspaces_slug (slug),
  KEY idx_cp_workspaces_owner (owner_user_id),
  CONSTRAINT fk_cp_workspaces_owner FOREIGN KEY (owner_user_id) REFERENCES cp_users (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cp_workspace_databases (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  workspace_id BIGINT UNSIGNED NOT NULL,
  db_host VARCHAR(255) NOT NULL DEFAULT 'localhost',
  db_name VARCHAR(64) NOT NULL,
  db_user VARCHAR(64) NOT NULL,
  db_password_enc TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cp_workspace_databases_workspace (workspace_id),
  CONSTRAINT fk_cp_workspace_databases_workspace FOREIGN KEY (workspace_id) REFERENCES cp_workspaces (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cp_workspace_members (
  workspace_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  role ENUM('owner','admin','member') NOT NULL DEFAULT 'member',
  PRIMARY KEY (workspace_id, user_id),
  CONSTRAINT fk_cp_members_workspace FOREIGN KEY (workspace_id) REFERENCES cp_workspaces (id),
  CONSTRAINT fk_cp_members_user FOREIGN KEY (user_id) REFERENCES cp_users (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS cp_provisioning_jobs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  workspace_id BIGINT UNSIGNED NOT NULL,
  step VARCHAR(64) NOT NULL,
  status ENUM('queued','running','done','failed') NOT NULL DEFAULT 'queued',
  error_message TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  finished_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_cp_jobs_workspace (workspace_id),
  CONSTRAINT fk_cp_jobs_workspace FOREIGN KEY (workspace_id) REFERENCES cp_workspaces (id)
) ENGINE=InnoDB;
