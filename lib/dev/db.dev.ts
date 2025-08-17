// lib/db.dev.ts
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "uma_banner_schedule",
  connectionLimit: 5,
});

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (Array.isArray(params)) {
    const [rows] = await pool.execute(text, params);
    return rows as T[];
  }
  const [rows] = await pool.query(text);
  return rows as T[];
}
