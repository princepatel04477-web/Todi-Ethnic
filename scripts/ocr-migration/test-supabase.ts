import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Load env
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
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Missing Supabase credentials.");
    process.exit(1);
  }

  console.log("🔌 Connecting to Supabase Client...");
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log("📋 Fetching first product...");
  const { data, error } = await supabase
    .from("products")
    .select("id, title, sku, image_urls")
    .limit(1);

  if (error) {
    console.error("❌ Supabase query failed:", error.message);
  } else {
    console.log("✅ Supabase query succeeded! Product found:", data[0]);
  }
}

main().catch(console.error);
