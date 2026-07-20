import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Load environment variables
const envPath = join(process.cwd(), ".env.local");
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
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function inject() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing Supabase URL or service role key in .env.local");
    process.exit(1);
  }

  console.log("🔌 Connecting to Supabase client...");
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  console.log("✅ Supabase client connected.");

  const mappingsPath = join(process.cwd(), "scripts/ocr-migration/reports/parsed-mappings.json");
  if (!existsSync(mappingsPath)) {
    console.error("❌ Mappings file not found at scripts/ocr-migration/reports/parsed-mappings.json");
    process.exit(1);
  }

  const mappings: Record<string, string> = JSON.parse(readFileSync(mappingsPath, "utf8"));
  console.log(`📋 Loaded ${Object.keys(mappings).length} product title mappings. Starting injection...`);

  let successCount = 0;
  let failCount = 0;

  for (const [sku, designNumber] of Object.entries(mappings)) {
    try {
      const { data, error } = await supabase
        .from("products")
        .update({ title: designNumber, updated_at: new Date().toISOString() })
        .eq("sku", sku)
        .select();

      if (error) {
        console.error(`  ❌ Failed to update product ${sku} to ${designNumber}: ${error.message}`);
        failCount++;
      } else if (!data || data.length === 0) {
        console.warn(`  ⚠️ Product with SKU ${sku} not found in database.`);
        failCount++;
      } else {
        console.log(`  ✅ Updated ${sku} -> ${designNumber}`);
        successCount++;
      }
    } catch (err: any) {
      console.error(`  ❌ Error updating product ${sku}: ${err.message}`);
      failCount++;
    }
  }

  console.log("\n==================================================");
  console.log("📊 INJECTION RESULTS");
  console.log("==================================================");
  console.log(`  Successfully Injected: ${successCount}`);
  console.log(`  Failed / Not Found    : ${failCount}`);
  console.log("==================================================");
}

inject().catch(console.error);
