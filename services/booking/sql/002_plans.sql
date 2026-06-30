-- Plans & usage tracking for ThesiBook tiers
USE thesibook_control;

ALTER TABLE cp_workspaces
  ADD COLUMN plan ENUM('free','small','unlimited') NOT NULL DEFAULT 'free' AFTER status,
  ADD COLUMN attendant_limit INT UNSIGNED NOT NULL DEFAULT 5 AFTER plan;

-- Cached count of distinct customers who booked (synced on dashboard load)
ALTER TABLE cp_workspaces
  ADD COLUMN attendant_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER attendant_limit;

-- Plan limits reference (payment hooks later)
CREATE TABLE IF NOT EXISTS cp_plans (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  name_el VARCHAR(128) NOT NULL,
  price_eur DECIMAL(6,2) NOT NULL DEFAULT 0,
  min_attendants INT UNSIGNED NOT NULL DEFAULT 0,
  max_attendants INT UNSIGNED NULL COMMENT 'NULL = unlimited',
  active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

INSERT INTO cp_plans (id, name_el, price_eur, min_attendants, max_attendants) VALUES
  ('free', 'Δωρεάν', 0, 0, 5),
  ('small', 'Μικρή', 7.00, 5, 10),
  ('unlimited', 'Απεριόριστη', 15.00, 10, NULL)
ON DUPLICATE KEY UPDATE name_el=VALUES(name_el), price_eur=VALUES(price_eur);
