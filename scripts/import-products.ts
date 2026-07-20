#!/usr/bin/env npx tsx
/**
 * Comprehensive product import script.
 *
 * Scans Products_Photos/ folder structure, uploads every image to Supabase
 * Storage (bucket: product-images) preserving folder hierarchy, then upserts
 * one product row per image with the Supabase Storage public URL.
 *
 * Safe to run multiple times — uses upsert on SKU to prevent duplicates.
 *
 * Usage: npx tsx scripts/import-products.ts
 *
 * Required env vars:
 *   SUPABASE_URL          — Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY — Service role key for admin storage uploads
 */

import { createClient } from "@supabase/supabase-js";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join, basename, extname } from "node:path";

// ---------------------------------------------------------------------------
// Environment loading
// ---------------------------------------------------------------------------

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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error("❌ SUPABASE_URL is not set. Check .env.local");
  process.exit(1);
}

if (!SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is empty in .env.local.");
  console.error("   Add your service_role key from Supabase Dashboard → Project Settings → API.");
  console.error("   This is required because storage write policies require admin authentication.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PRODUCTS_DIR = join(__dirname, "..", "Products_Photos");
const STORAGE_BUCKET = "product-images";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

const CATEGORY_MAP: Record<string, {
  name: string; slug: string; categoryId: string; code: string;
  storageFolder: string; description: string;
}> = {
  "Bridal_Photos": {
    name: "Bridal Lehenga",
    slug: "bridal-lehengas",
    categoryId: "c0000000-0000-0000-0000-000000000001",
    code: "BR",
    storageFolder: "bridal",
    description: "Premium handcrafted bridal masterpiece featuring timeless luxury embroidery crafted in Surat.",
  },
  "Farsi_lehenga": {
    name: "Farsi Lehenga",
    slug: "farsi-lehengas",
    categoryId: "c0000000-0000-0000-0000-000000000003",
    code: "FL",
    storageFolder: "farsi-lehengas",
    description: "Graceful trail lehenga crafted with heritage borders and intricate gold weaving from Surat.",
  },
  "Indo-Western": {
    name: "Indo-Western",
    slug: "indo-western",
    categoryId: "c0000000-0000-0000-0000-000000000004",
    code: "IW",
    storageFolder: "indo-western",
    description: "Contemporary fusion couture combining modern aesthetics with traditional artisanship.",
  },
  "Sider_Lehenga": {
    name: "Sider Lehenga",
    slug: "sider-lehengas",
    categoryId: "c0000000-0000-0000-0000-000000000002",
    code: "SL",
    storageFolder: "sider-lehengas",
    description: "Charming lehenga designed for bridesmaids and festive celebrations, crafted in Surat.",
  },
};

const CATEGORIES = Object.values(CATEGORY_MAP).map((c) => ({
  id: c.categoryId,
  name: c.name,
  slug: c.slug,
  description: c.description,
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.has(extname(name).toLowerCase());
}

function pad(n: number, len = 2): string {
  return String(n).padStart(len, "0");
}

function padSku(n: number): string {
  return String(n).padStart(3, "0");
}

function shouldBeFeatured(index: number, total: number): boolean {
  const step = Math.max(1, Math.floor(total / (total * 0.22)));
  return index % step === 0;
}

function shouldBeNewArrival(index: number, total: number): boolean {
  const offset2 = Math.floor(total * 0.1);
  const step = Math.max(1, Math.floor(total / (total * 0.15)));
  return (index + offset2) % step === 0;
}

async function fileExistsInBucket(supabase: ReturnType<typeof createClient>, path: string): Promise<boolean> {
  const { data } = await supabase.storage.from(STORAGE_BUCKET).list(path.split("/").slice(0, -1).join("/"), {
    limit: 1,
    search: basename(path),
  } as Record<string, unknown>);
  return (data && data.length > 0) || false;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🔌 Connecting to Supabase...");
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Ensure categories exist
  console.log("\n📋 Seeding categories...");
  for (const cat of CATEGORIES) {
    const { error } = await supabase.from("categories").upsert(
      { id: cat.id, name: cat.name, slug: cat.slug, description: cat.description },
      { onConflict: "id" }
    );
    if (error) {
      console.error(`  ❌ Failed to upsert category "${cat.name}": ${error.message}`);
      process.exit(1);
    }
    console.log(`  ✅ ${cat.name}`);
  }

  // 2. Scan folders and collect all products
  console.log("\n🔍 Scanning Products_Photos/...");
  const allProducts: Array<{
    localPath: string;
    storagePath: string;
    product: Record<string, unknown>;
  }> = [];

  for (const [folderName, cat] of Object.entries(CATEGORY_MAP)) {
    const folderPath = join(PRODUCTS_DIR, folderName);
    if (!existsSync(folderPath)) {
      console.log(`  ⚠️  Skipping "${folderName}" — folder not found`);
      continue;
    }

    const files = readdirSync(folderPath).filter(isImageFile).sort();
    console.log(`  📁 ${cat.name}: ${files.length} images`);

    for (let i = 0; i < files.length; i++) {
      const filename = files[i];
      const num = i + 1;
      const skuNum = padSku(num);
      const designNum = pad(num);
      const sku = `TC-${cat.code}-${skuNum}`;
      const ext = extname(filename).toLowerCase();
      const storageFilename = `${cat.code}-${designNum}${ext}`;
      const storagePath = `${cat.storageFolder}/${storageFilename}`;

      const total = files.length;
      const featured = shouldBeFeatured(i, total);
      const newArrival = shouldBeNewArrival(i, total);

      allProducts.push({
        localPath: join(folderPath, filename),
        storagePath,
        product: {
          title: `${cat.name} ${designNum}`,
          slug: `${cat.slug}-${designNum}`,
          description: cat.description,
          sku,
          category_id: cat.categoryId,
          fabric: cat.name,
          featured,
          new_arrival: newArrival,
          stock: 5,
        },
      });
    }
  }

  console.log(`\n📦 Total products to import: ${allProducts.length}`);

  // 3. Upload images to Supabase Storage
  console.log("\n☁️  Uploading images to Supabase Storage...");
  let uploadedCount = 0;
  let skippedCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < allProducts.length; i++) {
    const { localPath, storagePath } = allProducts[i];
    const progress = `[${i + 1}/${allProducts.length}]`;

    // Check if already uploaded (skip duplicates)
    const exists = await fileExistsInBucket(supabase, storagePath);
    if (exists) {
      skippedCount++;
      if (skippedCount % 20 === 0) console.log(`  ${progress} Skipped ${skippedCount} existing files so far...`);
      continue;
    }

    try {
      const fileBuffer = readFileSync(localPath);
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, fileBuffer, {
          contentType: extname(localPath) === ".png" ? "image/png" :
                       extname(localPath) === ".webp" ? "image/webp" : "image/jpeg",
          cacheControl: "31536000",
          upsert: true,
        });

      if (error) {
        errors.push(`  ❌ Upload failed for ${storagePath}: ${error.message}`);
      } else {
        uploadedCount++;
        if (uploadedCount % 10 === 0) console.log(`  ${progress} Uploaded ${uploadedCount} images...`);
      }
    } catch (err) {
      errors.push(`  ❌ Error uploading ${storagePath}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  console.log(`\n  ✅ Uploaded: ${uploadedCount}`);
  console.log(`  ⏭️  Skipped (already exists): ${skippedCount}`);
  if (errors.length > 0) {
    console.log(`  ⚠️  Errors: ${errors.length}`);
    errors.forEach((e) => console.error(e));
  }

  // 4. Build product rows with public URLs
  console.log("\n🔗 Resolving public URLs...");
  const productRows = allProducts.map(({ product, storagePath }) => {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);
    return {
      ...product,
      image_urls: [data.publicUrl],
    };
  });

  // 5. Upsert products into database
  console.log("\n💾 Upserting products into database...");
  const BATCH_SIZE = 20;
  let insertedCount = 0;
  let updatedCount = 0;

  for (let i = 0; i < productRows.length; i += BATCH_SIZE) {
    const batch = productRows.slice(i, i + BATCH_SIZE);
    const progress = `[${Math.min(i + BATCH_SIZE, productRows.length)}/${productRows.length}]`;

    for (const row of batch) {
      const { error, status: httpStatus } = await supabase
        .from("products")
        .upsert(row, { onConflict: "sku", ignoreDuplicates: false });

      if (error) {
        console.error(`  ❌ Failed to upsert "${row.title}" (SKU: ${row.sku}): ${error.message}`);
      } else if (httpStatus === 201) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }
    console.log(`  ${progress} Batch processed...`);
  }

  // 6. Summary
  const featuredCount = productRows.filter((p) => p.featured).length;
  const newArrivalCount = productRows.filter((p) => p.new_arrival).length;

  console.log("\n" + "=".repeat(60));
  console.log("✨ IMPORT COMPLETE");
  console.log("=".repeat(60));
  console.log(`  📸 Images uploaded: ${uploadedCount}`);
  console.log(`  ⏭️  Skipped (exists): ${skippedCount}`);
  console.log(`  📝 Products inserted: ${insertedCount}`);
  console.log(`  🔄 Products updated: ${updatedCount}`);
  console.log(`  ⭐ Featured: ${featuredCount} (${((featuredCount / productRows.length) * 100).toFixed(1)}%)`);
  console.log(`  🆕 New Arrivals: ${newArrivalCount} (${((newArrivalCount / productRows.length) * 100).toFixed(1)}%)`);
  if (errors.length > 0) {
    console.log(`  ⚠️  Upload errors: ${errors.length}`);
  }
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});
