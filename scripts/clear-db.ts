import pg from "pg";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Manually load env variables from .env.local
const envPath = join(__dirname, "../.env.local");
if (existsSync(envPath)) {
  console.log(`📝 Loading environment from ${envPath}...`);
  const envContent = readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const firstEquals = trimmed.indexOf("=");
      if (firstEquals !== -1) {
        const key = trimmed.substring(0, firstEquals).trim();
        let val = trimmed.substring(firstEquals + 1).trim();
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
          val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
      }
    }
  });
}

async function run() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error("❌ POSTGRES_URL is not set in environment");
    process.exit(1);
  }

  console.log("🔌 Connecting to PostgreSQL database...");
  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  await client.connect();
  console.log("✅ Connected!");

  console.log("🧹 Deleting all products from the products table...");
  const { rowCount } = await client.query("DELETE FROM products");
  console.log(`✅ Success! Deleted ${rowCount} products.`);

  await client.end();
}

run().catch((err) => {
  console.error("❌ Failed to clear database:", err);
  process.exit(1);
});
