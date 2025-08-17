import mysql from "mysql2/promise";
import { neon } from "@neondatabase/serverless";
import { isDevApp } from "./env";

let sql: any;

if (isDevApp) {
  // Local MySQL (or MariaDB)
  sql = async (query: string, params?: any[]) => {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "password",
      database: process.env.DB_NAME || "uma_banner_schedule",
    });
    const [rows] = await connection.execute(query, params);
    await connection.end();
    return rows;
  };
} else {
  // Neon Postgres
  sql = neon(process.env.DATABASE_URL!);
}

export { sql };