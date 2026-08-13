#!/usr/bin/env node
/**
 * Seed cp_db_pool from scripts/deploy/db-pool.json (never commit real file).
 * Usage: node scripts/deploy/seed-db-pool.mjs
 * Env: BOOKING_DB_HOST, BOOKING_DB_USER, BOOKING_DB_PASSWORD, BOOKING_DB_NAME
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const poolFile = process.env.POOL_FILE ?? path.join(__dirname, "db-pool.json");

if (!fs.existsSync(poolFile)) {
  console.error(`Missing ${poolFile} — copy db-pool.json.example and fill credentials.`);
  process.exit(1);
}

const entries = JSON.parse(fs.readFileSync(poolFile, "utf8"));
if (!Array.isArray(entries) || entries.length === 0) {
  console.error("db-pool.json must be a non-empty array.");
  process.exit(1);
}

const {
  BOOKING_DB_HOST = "localhost",
  BOOKING_DB_USER,
  BOOKING_DB_PASSWORD,
  BOOKING_DB_NAME,
} = process.env;

if (!BOOKING_DB_USER || !BOOKING_DB_PASSWORD || !BOOKING_DB_NAME) {
  console.error("Set BOOKING_DB_HOST, BOOKING_DB_USER, BOOKING_DB_PASSWORD, BOOKING_DB_NAME");
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: BOOKING_DB_HOST,
  user: BOOKING_DB_USER,
  password: BOOKING_DB_PASSWORD,
  database: BOOKING_DB_NAME,
});

let inserted = 0;
for (const row of entries) {
  const { db_name, db_user, db_password, db_host } = row;
  if (!db_name || !db_user || !db_password || !db_host) {
    console.warn("Skipping incomplete row:", row);
    continue;
  }
  const [result] = await conn.execute(
    `INSERT INTO cp_db_pool (db_host, db_name, db_user, db_password_enc, status)
     VALUES (?, ?, ?, ?, 'available')
     ON DUPLICATE KEY UPDATE
       db_host = VALUES(db_host),
       db_user = VALUES(db_user),
       db_password_enc = VALUES(db_password_enc),
       status = IF(status = 'assigned', status, 'available')`,
    [db_host, db_name, db_user, db_password],
  );
  if (result.affectedRows > 0) inserted += 1;
}

const [counts] = await conn.query(
  "SELECT status, COUNT(*) AS c FROM cp_db_pool GROUP BY status",
);
console.log("Pool seed complete.", { inserted, counts });
await conn.end();
