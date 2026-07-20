#!/usr/bin/env npx tsx
/**
 * Generate product data from the Products_Photos/ folder structure.
 *
 * Scans Bridal_Photos/, Farsi_lehenga/, Indo-Western/, Sider_Lehenga/
 * and produces src/lib/services/generatedProducts.ts with one product
 * per image. IDs, slugs, featured/newArrival flags are deterministic.
 *
 * Usage: npx tsx scripts/generate-products.ts
 */

import { readdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const PRODUCTS_DIR = join(__dirname, "..", "Products_Photos");
const OUTPUT_FILE = join(
  __dirname,
  "..",
  "src",
  "lib",
  "services",
  "generatedProducts.ts"
);

const CATEGORY_MAP: Record<
  string,
  { name: string; slug: string; categoryId: string; code: string; description: string }
> = {
  "Bridal_Photos": {
    name: "Bridal Lehenga",
    slug: "bridal-lehengas",
    categoryId: "c0000000-0000-0000-0000-000000000001",
    code: "BR",
    description:
      "Premium handcrafted bridal masterpiece featuring timeless luxury motifs.",
  },
  "Farsi_lehenga": {
    name: "Farsi Lehenga",
    slug: "farsi-lehengas",
    categoryId: "c0000000-0000-0000-0000-000000000003",
    code: "FL",
    description:
      "Graceful trail lehenga crafted with heritage borders and gold weaving.",
  },
  "Indo-Western": {
    name: "Indo-Western",
    slug: "indo-western",
    categoryId: "c0000000-0000-0000-0000-000000000004",
    code: "IW",
    description:
      "Contemporary fusion outfit combining modern aesthetics with traditional silhouettes.",
  },
  "Sider_Lehenga": {
    name: "Sider Lehenga",
    slug: "sider-lehengas",
    categoryId: "c0000000-0000-0000-0000-000000000002",
    code: "SL",
    description:
      "Charming lehenga designed for bridesmaids and festive celebrations.",
  },
};

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

interface ProductEntry {
  id: string;
  name: string;
  title: string;
  category: string;
  image: string;
  slug: string;
  featured: boolean;
  newArrival: boolean;
  sku: string;
  fabric: string;
  image_urls: string[];
  category_id: string;
  stock: number;
  created_at: string;
  updated_at: string;
  deleted_at: null;
  description: string;
}

function isImageFile(filename: string): boolean {
  const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

function getFilesInFolder(folderPath: string): string[] {
  if (!existsSync(folderPath)) return [];
  return readdirSync(folderPath)
    .filter(isImageFile)
    .sort();
}

function padNum(n: number): string {
  return String(n).padStart(2, "0");
}

function padSkuNum(n: number): string {
  return String(n).padStart(3, "0");
}

function generateProducts(): { products: ProductEntry[]; countByCategory: Record<string, number> } {
  const products: ProductEntry[] = [];
  const countByCategory: Record<string, number> = {};

  for (const [folderName, cat] of Object.entries(CATEGORY_MAP)) {
    const folderPath = join(PRODUCTS_DIR, folderName);
    const files = getFilesInFolder(folderPath);

    countByCategory[cat.name] = files.length;

    files.forEach((filename, i) => {
      const num = i + 1;
      const pad = padNum(num);
      const skuPad = padSkuNum(num);

      const total = files.length;
      const featured = shouldBeFeatured(i, total);
      const newArrival = shouldBeNewArrival(i, total);

      const product: ProductEntry = {
        id: `TC-${cat.code}-${skuPad}`,
        name: `${cat.name} ${pad}`,
        title: `${cat.name} ${pad}`,
        category: cat.name,
        image: `/Products_Photos/${folderName}/${filename}`,
        slug: `${cat.slug}-${pad}`,
        featured,
        newArrival,
        sku: `TC-${cat.code}-${skuPad}`,
        fabric: cat.name,
        image_urls: [`/Products_Photos/${folderName}/${filename}`],
        category_id: cat.categoryId,
        stock: 5,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
        description: cat.description,
      };

      products.push(product);
    });
  }

  return { products, countByCategory };
}

function shouldBeFeatured(index: number, total: number): boolean {
  const targetRatio = 0.22;
  const step = Math.max(1, Math.floor(total / (total * targetRatio)));
  return index % step === 0;
}

function shouldBeNewArrival(index: number, total: number): boolean {
  const targetRatio = 0.15;
  const offset = Math.floor(total * 0.1);
  const step = Math.max(1, Math.floor(total / (total * targetRatio)));
  return (index + offset) % step === 0;
}

function formatProduct(p: ProductEntry): string {
  const fields = [
    `    id: "${p.id}"`,
    `    name: "${p.name}"`,
    `    title: "${p.title}"`,
    `    category: "${p.category}"`,
    `    image: \`${p.image}\``,
    `    slug: "${p.slug}"`,
    `    featured: ${p.featured}`,
    `    newArrival: ${p.newArrival}`,
    `    sku: "${p.sku}"`,
    `    fabric: "${p.fabric}"`,
    `    image_urls: [\`${p.image}\`]`,
    `    category_id: "${p.category_id}"`,
    `    stock: ${p.stock}`,
    `    created_at: "${p.created_at}"`,
    `    updated_at: "${p.updated_at}"`,
    `    deleted_at: null`,
    `    description: "${p.description}"`,
  ].join(",\n");
  return `  {\n${fields}\n  }`;
}

function main() {
  console.log("🔍 Scanning Products_Photos/ for product images...\n");

  const { products, countByCategory } = generateProducts();

  console.log("📊 Products by category:");
  for (const [name, count] of Object.entries(countByCategory)) {
    console.log(`  ${name}: ${count}`);
  }
  console.log(`\n📦 Total products: ${products.length}`);

  const featuredCount = products.filter((p) => p.featured).length;
  const newArrivalCount = products.filter((p) => p.newArrival).length;
  console.log(`⭐ Featured: ${featuredCount} (${((featuredCount / products.length) * 100).toFixed(1)}%)`);
  console.log(`🆕 New Arrivals: ${newArrivalCount} (${((newArrivalCount / products.length) * 100).toFixed(1)}%)`);

  const productEntries = products.map(formatProduct).join(",\n");

  const content = `// AUTO-GENERATED by scripts/generate-products.ts
// Do not edit manually — re-run the script when images change.
//
// Generated at: ${new Date().toISOString()}
// Product count: ${products.length}
// Categories: ${Object.entries(countByCategory).map(([k, v]) => `${k} (${v})`).join(", ")}

import type { Product } from "./products";

export const generatedProducts: Product[] = [
${productEntries}
];
`;
  writeFileSync(OUTPUT_FILE, content, "utf-8");
  console.log(`\n✅ Written ${products.length} products to ${OUTPUT_FILE}`);
}

main();
