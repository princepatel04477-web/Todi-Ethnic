import { generatedProducts } from "../src/lib/services/productsData";
import { writeFileSync } from "fs";
import { join } from "path";

function generate() {
  let sql = `-- Migration: Add new_arrival column and seed all 60 premium products
-- Date: 2026-07-04

-- 1. Ensure new_arrival column exists on products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS new_arrival BOOLEAN DEFAULT false NOT NULL;

-- 2. Clear existing products to ensure clean seed
DELETE FROM products;

-- 3. Upsert categories with exact names requested by client
INSERT INTO categories (id, name, slug, description, image_url)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Bridal Collection', 'bridal-collection', 'Luxury bridal masterpieces handcrafted with timeless embroidery and royal craftsmanship.', '/images/categories/Bridal-cc.png'),
  ('c0000000-0000-0000-0000-000000000002', 'Sider Lehenga', 'sider-lehengas', 'Elegant festive silhouettes designed for bridesmaids, celebrations and modern occasions.', '/images/categories/Sider.png'),
  ('c0000000-0000-0000-0000-000000000003', 'Farsi Lehenga', 'farsi-lehengas', 'Classic heritage-inspired designs featuring graceful flares and intricate artisan detailing.', '/images/categories/Farsi.png'),
  ('c0000000-0000-0000-0000-000000000004', 'Indo Western', 'indo-western', 'Contemporary fusion couture combining modern fashion with traditional elegance.', '/images/categories/Indo-Western.png')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 4. Seed 60 premium products
INSERT INTO products (id, title, slug, description, sku, category_id, fabric, image_urls, featured, new_arrival, stock, created_at, updated_at)
VALUES
`;

  const valueStrings = generatedProducts.map((p) => {
    // Generate UUID from the SKU so it's a valid UUID in the DB
    // e.g. TC-BR-001 -> '00000000-0000-0000-0000-000000000b01'
    const code = p.sku.split("-")[1]; // e.g. BR
    const num = p.sku.split("-")[2]; // e.g. 001
    const prefixMap: Record<string, string> = {
      BR: "b",
      FL: "f",
      IW: "c",
      SL: "d",
    };
    const codeChar = prefixMap[code] || "a";
    const uuid = `00000000-0000-0000-0000-00000000${codeChar}${num}`;

    const title = p.title.replace(/'/g, "''");
    const slug = p.slug;
    const description = p.description.replace(/'/g, "''");
    const sku = p.sku;
    const catId = p.category_id;
    const fabric = p.fabric.replace(/'/g, "''");
    const imageUrl = p.image;
    const featured = p.featured ? "true" : "false";
    const newArrival = p.newArrival ? "true" : "false";
    const stock = p.stock || 5;
    const createdAt = p.created_at || new Date().toISOString();
    const updatedAt = p.updated_at || new Date().toISOString();

    return `  ('${uuid}', '${title}', '${slug}', '${description}', '${sku}', '${catId}', '${fabric}', ARRAY['${imageUrl}'], ${featured}, ${newArrival}, ${stock}, '${createdAt}', '${updatedAt}')`;
  });

  sql += valueStrings.join(",\n") + ";\n";

  const outputPath = join(__dirname, "../supabase/migrations/20260704110000_add_new_arrival_and_seed.sql");
  writeFileSync(outputPath, sql, "utf8");
  console.log(`Successfully generated SQL seed migration at ${outputPath}`);
}

generate();
