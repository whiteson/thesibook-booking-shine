#!/usr/bin/env php
<?php
/**
 * Seed cp_db_pool from JSON file (run on server via deploy).
 * Usage: POOL_FILE=/tmp/db-pool.json BOOKING_DB_* php seed-db-pool.php
 */
declare(strict_types=1);

$poolFile = getenv('POOL_FILE') ?: (__DIR__ . '/db-pool.json');
$host = getenv('BOOKING_DB_HOST') ?: 'localhost';
$user = getenv('BOOKING_DB_USER') ?: '';
$pass = getenv('BOOKING_DB_PASSWORD') ?: '';
$name = getenv('BOOKING_DB_NAME') ?: '';

if (!is_readable($poolFile)) {
    fwrite(STDERR, "Missing pool file: {$poolFile}\n");
    exit(1);
}
if ($user === '' || $name === '') {
    fwrite(STDERR, "Set BOOKING_DB_USER and BOOKING_DB_NAME\n");
    exit(1);
}

$entries = json_decode((string) file_get_contents($poolFile), true);
if (!is_array($entries) || $entries === []) {
    fwrite(STDERR, "db-pool.json must be a non-empty array\n");
    exit(1);
}

$dsn = "mysql:host={$host};dbname={$name};charset=utf8mb4";
$pdo = new PDO($dsn, $user, $pass, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$sql = <<<'SQL'
INSERT INTO cp_db_pool (db_host, db_name, db_user, db_password_enc, status)
VALUES (:host, :name, :user, :pass, 'available')
ON DUPLICATE KEY UPDATE
  db_host = VALUES(db_host),
  db_user = VALUES(db_user),
  db_password_enc = VALUES(db_password_enc),
  status = IF(status = 'assigned', status, 'available')
SQL;

$stmt = $pdo->prepare($sql);
$count = 0;
foreach ($entries as $row) {
    if (empty($row['db_name']) || empty($row['db_user']) || empty($row['db_password']) || empty($row['db_host'])) {
        fwrite(STDERR, "Skipping incomplete row\n");
        continue;
    }
    $stmt->execute([
        ':host' => $row['db_host'],
        ':name' => $row['db_name'],
        ':user' => $row['db_user'],
        ':pass' => $row['db_password'],
    ]);
    $count++;
}

$status = $pdo->query('SELECT status, COUNT(*) AS c FROM cp_db_pool GROUP BY status')->fetchAll(PDO::FETCH_ASSOC);
echo "Pool seed complete. rows={$count}\n";
echo json_encode($status, JSON_PRETTY_PRINT) . "\n";
