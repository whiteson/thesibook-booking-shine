import mysql from "mysql2/promise";

let pool: mysql.Pool | null = null;

export function getControlPlanePool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.BOOKING_DB_HOST ?? "localhost",
      user: process.env.BOOKING_DB_USER ?? "root",
      password: process.env.BOOKING_DB_PASSWORD ?? "password",
      database: process.env.BOOKING_DB_NAME ?? "thesibook_control",
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function getTenantAttendantCount(
  dbName: string,
  dbHost: string,
  dbUser: string,
  dbPassword: string,
): Promise<number> {
  const conn = await mysql.createConnection({
    host: dbHost,
    user: dbUser,
    password: dbPassword,
    database: dbName,
  });
  try {
    const [rows] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(DISTINCT a.id_users_customer) AS cnt
       FROM ea_appointments a
       WHERE a.is_unavailability = 0 AND a.id_users_customer IS NOT NULL`,
    );
    return Number(rows[0]?.cnt ?? 0);
  } catch {
    return 0;
  } finally {
    await conn.end();
  }
}
