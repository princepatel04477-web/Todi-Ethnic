import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const mappingsPath = join(process.cwd(), "scripts/ocr-migration/reports/parsed-mappings.json");
const mappings: Record<string, string> = JSON.parse(readFileSync(mappingsPath, "utf8"));

const sqlFiles = [
  join(process.cwd(), "supabase/migrations/20260704110000_add_new_arrival_and_seed.sql"),
  join(process.cwd(), "supabase/migrations/20260703000000_seed_products.sql"),
  join(process.cwd(), "combined-schema.sql")
];

for (const filePath of sqlFiles) {
  if (!existsSync(filePath)) {
    console.warn(`⚠️ File not found: ${filePath}`);
    continue;
  }
  console.log(`Processing ${filePath}...`);
  const content = readFileSync(filePath, "utf8");
  
  const lines = content.split("\n");
  let replacedCount = 0;

  const updatedLines = lines.map(line => {
    for (const [sku, designNumber] of Object.entries(mappings)) {
      if (line.includes(`'${sku}'`)) {
        // Match: ('id', 'title', 'slug', 'description', 'sku'
        const regex = new RegExp(`(\\('[a-z0-9-]+',\\s*)'[^']+'(,\\s*'[^']+',\\s*'[^']+',\\s*'${sku}')`, 'i');
        if (regex.test(line)) {
          replacedCount++;
          return line.replace(regex, `$1'${designNumber}'$2`);
        }
      }
    }
    return line;
  });
  
  writeFileSync(filePath, updatedLines.join("\n"), "utf8");
  console.log(`✅ Updated ${filePath} (replaced ${replacedCount} product titles).`);
}
