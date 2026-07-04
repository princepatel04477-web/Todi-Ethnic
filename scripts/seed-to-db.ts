import { createClient } from "@supabase/supabase-js";
import { generatedProducts } from "../src/lib/services/productsData";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

// Load local environment
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

async function seed() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || supabaseUrl.includes("placeholder")) {
    console.error("❌ Missing Supabase credentials in .env.local.");
    console.error("Please add your real NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local first.");
    process.exit(1);
  }

  console.log("🔌 Connecting to Supabase at:", supabaseUrl);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // 1. Seed categories
  console.log("📋 Ensuring categories are seeded...");
  const categories = [
    {
      id: "c0000000-0000-0000-0000-000000000001",
      name: "Bridal Collection",
      slug: "bridal-collection",
      description: "Luxury bridal masterpieces handcrafted with timeless embroidery and royal craftsmanship.",
    },
    {
      id: "c0000000-0000-0000-0000-000000000002",
      name: "Sider Lengha",
      slug: "sider-lengha",
      description: "Elegant festive silhouettes designed for bridesmaids, celebrations and modern occasions.",
    },
    {
      id: "c0000000-0000-0000-0000-000000000003",
      name: "Farsi Lengha",
      slug: "farsi-lengha",
      description: "Classic heritage-inspired designs featuring graceful flares and intricate artisan detailing.",
    },
    {
      id: "c0000000-0000-0000-0000-000000000004",
      name: "Indo Western",
      slug: "indo-western",
      description: "Contemporary fusion couture combining modern fashion with traditional elegance.",
    },
  ];

  for (const cat of categories) {
    const { error } = await supabase.from("categories").upsert(cat, { onConflict: "slug" });
    if (error) {
      console.error(`❌ Error seeding category ${cat.name}:`, error.message);
      process.exit(1);
    }
  }
  console.log("✅ Categories seeded successfully.");

  // 2. Delete existing products
  console.log("🗑️  Cleaning products table...");
  const { error: deleteError } = await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError) {
    console.error("❌ Error cleaning products table:", deleteError.message);
    process.exit(1);
  }

  // 3. Insert products
  console.log(`📝 Seeding ${generatedProducts.length} products...`);
  const productsToInsert = generatedProducts.map((p) => {
    const code = p.sku.split("-")[1];
    const num = p.sku.split("-")[2];
    const prefixMap: Record<string, string> = {
      BR: "b",
      FL: "f",
      IW: "i",
      SL: "s",
    };
    const codeChar = prefixMap[code] || "a";
    const uuid = `00000000-0000-0000-0000-00000000${codeChar}${num}`;

    return {
      id: uuid,
      title: p.title,
      slug: p.slug,
      description: p.description,
      sku: p.sku,
      category_id: p.category_id,
      fabric: p.fabric,
      image_urls: [p.image],
      featured: p.featured,
      new_arrival: p.newArrival,
      stock: p.stock || 5,
    };
  });

  const { error: insertError } = await supabase.from("products").insert(productsToInsert);
  if (insertError) {
    console.error("❌ Error inserting products:", insertError.message);
    process.exit(1);
  }

  console.log("✨ Seeding completed successfully!");
}

seed().catch((err) => {
  console.error("❌ Unhandled seeding error:", err);
  process.exit(1);
});
