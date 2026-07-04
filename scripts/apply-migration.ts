#!/usr/bin/env npx tsx
/**
 * Applies all SQL migrations to the remote Supabase database.
 */

import pg from "pg";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DB_USER = "postgres";
const DB_PASS = "Gautam_todi@123";
const DB_HOST = "db.byozkbjcsrlbeemveawy.supabase.co";
const DB_PORT = 5432;
const DB_NAME = "postgres";

async function applyMigrations() {
  console.log("🔌 Connecting to PostgreSQL...");
  const client = new pg.Client({
    user: DB_USER,
    password: DB_PASS,
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  await client.connect();
  console.log("✅ Connected!\n");

  const migrationsDir = join(__dirname, "..", "supabase", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`📋 Found ${files.length} migration files:\n`);

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    const sql = readFileSync(filePath, "utf8");
    
    console.log(`  ▶ Applying ${file} (${sql.length} bytes)...`);
    
    try {
      await client.query(sql);
      console.log(`  ✅ ${file} applied successfully.`);
    } catch (err) {
      console.error(`  ❌ Failed to apply ${file}:`, (err as Error).message);
      await client.end();
      process.exit(1);
    }
  }

  console.log("\n🎉 All migrations applied successfully!");
  await client.end();
}

applyMigrations().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
