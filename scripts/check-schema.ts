#!/usr/bin/env npx tsx
/**
 * Applies schema by creating tables via Supabase REST API (Management API).
 * Uses service_role key for authentication.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// Load env
const envPath = join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eq = trimmed.indexOf("=");
      if (eq !== -1) {
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    }
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

async function main() {
  console.log("🔌 Connecting via Supabase Management API...\n");

  // Check existing tables
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/categories?limit=1`, {
    headers: {
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "apikey": SERVICE_ROLE_KEY,
    },
  });
  
  if (checkRes.ok) {
    console.log("✅ Tables already exist! Schema is applied.\n");
    process.exit(0);
  }

  console.log(`  Categories check: ${checkRes.status} ${checkRes.statusText}`);
  
  // The schema needs to be applied via the SQL Editor or pg connection.
  // The REST API can't execute DDL (CREATE TABLE). 
  console.log("\n❌ Tables don't exist yet.");
  console.log("   The schema must be applied via one of:");
  console.log("   1. Supabase Dashboard → SQL Editor (paste combined migrations)");
  console.log("   2. Correct database password for direct pg connection");
  console.log("\n   Generating combined SQL for manual application...\n");

  // Read and combine all migrations
  const migrationsDir = join(__dirname, "..", "supabase", "migrations");
  const { readdirSync: rd } = await import("node:fs");
  const files = rd(migrationsDir).filter(f => f.endsWith(".sql")).sort();

  let combined = "-- Combined Todi Creation Schema\n-- Generated for manual application\n\n";
  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    combined += `-- ========== ${file} ==========\n${sql}\n\n`;
  }

  const outputPath = join(__dirname, "..", "combined-schema.sql");
  const { writeFileSync: wf } = await import("node:fs");
  wf(outputPath, combined, "utf-8");
  console.log(`✅ Combined SQL written to: ${outputPath}`);
  console.log(`   Open Supabase Dashboard → SQL Editor → paste entire file → Run`);
}

main().catch(console.error);
