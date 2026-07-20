import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const reportPath = join(process.cwd(), "scripts/ocr-migration/reports/migration-report.md");
const manualReviewPath = join(process.cwd(), "scripts/ocr-migration/reports/manual-review.json");

function parseReport() {
  const content = readFileSync(reportPath, "utf8");
  const lines = content.split("\n");
  const mapping: Record<string, string> = {};

  // Parse successfully migrated table
  let inSuccessTable = false;
  for (const line of lines) {
    if (line.includes("Successfully Migrated Products")) {
      inSuccessTable = true;
      continue;
    }
    if (inSuccessTable && line.trim() === "") {
      // Empty line could end table, but let's just parse lines starting with |
    }
    if (line.startsWith("|")) {
      const parts = line.split("|").map(p => p.trim());
      if (parts.length >= 6) {
        const sku = parts[1];
        const originalTitle = parts[2];
        const newTitle = parts[3].replace(/\*\*/g, ""); // Remove bold marks **
        if (sku && sku.startsWith("TC-") && newTitle && newTitle !== "New Title (design number)" && !newTitle.startsWith("---")) {
          mapping[sku] = newTitle;
        }
      }
    }
  }

  // Parse manual review JSON
  try {
    const manualReview = JSON.parse(readFileSync(manualReviewPath, "utf8"));
    for (const item of manualReview) {
      if (item.sku && item.extractedDesignNumber) {
        mapping[item.sku] = item.extractedDesignNumber;
      }
    }
  } catch (e) {
    console.error("Error reading manual-review.json:", e);
  }

  console.log(`Parsed ${Object.keys(mapping).length} product mappings.`);
  writeFileSync(join(process.cwd(), "scripts/ocr-migration/reports/parsed-mappings.json"), JSON.stringify(mapping, null, 2));
}

parseReport();
