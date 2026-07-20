import { DbService, DBProduct } from "./db-service";
import { OcrService } from "./ocr-service";
import { runValidation } from "./validation-service";
import { ReportGenerator, MigrationRecord, MigrationSummary } from "./report-generator";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join, extname } from "path";

// Concurrency limit for OCR processing
const OCR_CONCURRENCY = 4;

async function getLocalImagePath(imageUrl: string): Promise<string> {
  // If it's a relative path in Products_Photos
  if (imageUrl.startsWith("/Products_Photos/")) {
    const localPath = join(process.cwd(), imageUrl);
    if (existsSync(localPath)) return localPath;
  }

  // If it's a public Supabase URL
  if (imageUrl.includes("/storage/v1/object/public/product-images/")) {
    const parts = imageUrl.split("/storage/v1/object/public/product-images/");
    const storagePath = parts[1]; // e.g. "bridal/BR-01.jpeg"
    if (storagePath) {
      const [folder, filename] = storagePath.split("/");
      // Map storage folder to local folder
      const folderMap: Record<string, { dir: string; prefix: string }> = {
        "bridal": { dir: "Bridal_Photos", prefix: "BR" },
        "farsi-lehengas": { dir: "Farsi_lehenga", prefix: "FL" },
        "indo-western": { dir: "Indo-Western", prefix: "IW" },
        "sider-lehengas": { dir: "Sider_Lehenga", prefix: "SL" },
      };

      const mapping = folderMap[folder];
      if (mapping) {
        // e.g. "BR-01.jpeg" -> index 0
        const match = filename.match(/^[A-Z]+-(\d+)\.(jpeg|jpg|png|webp)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          const index = num - 1;
          const localDir = join(process.cwd(), "Products_Photos", mapping.dir);
          if (existsSync(localDir)) {
            const { readdirSync } = require("fs");
            const files = readdirSync(localDir).filter((f: string) => {
              const ext = extname(f).toLowerCase();
              return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
            }).sort();

            if (files[index]) {
              const localPath = join(localDir, files[index]);
              if (existsSync(localPath)) {
                return localPath;
              }
            }
          }
        }
      }
    }
  }

  // Fallback: Download the image from the URL
  const tempDir = join(__dirname, "temp_downloads");
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  const hash = require("crypto").createHash("md5").update(imageUrl).digest("hex");
  const ext = extname(imageUrl.split("?")[0]) || ".jpg";
  const tempPath = join(tempDir, `${hash}${ext}`);

  if (existsSync(tempPath)) {
    return tempPath;
  }

  console.log(`📥 Downloading image from: ${imageUrl}`);
  const res = await fetch(imageUrl);
  if (!res.ok) {
    throw new Error(`Failed to download image: ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  writeFileSync(tempPath, buffer);
  return tempPath;
}

async function main() {
  const startTime = new Date();
  console.log("🚀 Starting Product Title OCR Migration Script...");
  console.log(`Time: ${startTime.toISOString()}\n`);

  const db = new DbService();
  const ocr = new OcrService();

  try {
    // Step 1: Connect and fetch products
    await db.connect();
    const products = await db.fetchProducts();

    if (products.length === 0) {
      console.log("⚠️ No active products found in the database. Exiting.");
      return;
    }

    // Step 2: Backup
    console.log("\n🛡️  Creating database backup...");
    await db.createBackupTable(products);
    db.saveLocalBackup(products);

    // Initialize OCR service
    await ocr.init();

    // Step 3: Run OCR on images in parallel batches
    console.log(`\n📷 Running OCR on ${products.length} product images...`);
    const records: MigrationRecord[] = [];
    let completedCount = 0;

    // Helper to process a single product
    const processProduct = async (product: DBProduct): Promise<MigrationRecord> => {
      const record: MigrationRecord = {
        productId: product.id,
        originalTitle: product.title,
        sku: product.sku,
        imageUrl: product.image_urls[0] || "",
        extractedDesignNumber: null,
        confidence: 0,
        status: "failed",
        attempts: [],
      };

      if (!record.imageUrl) {
        record.status = "error";
        record.errorDetails = "Product does not have an image URL.";
        return record;
      }

      try {
        const localPath = await getLocalImagePath(record.imageUrl);
        record.localPath = localPath;

        // Run OCR with retries
        let ocrResult = null;
        let ocrError = null;
        
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            ocrResult = await ocr.processImage(localPath);
            break; // Success
          } catch (err: any) {
            ocrError = err;
            console.warn(`  ⚠️ Attempt ${attempt} failed for ${product.sku}: ${err.message}`);
          }
        }

        if (ocrResult) {
          record.attempts = ocrResult.attempts;
          if (ocrResult.designNumber) {
            const validation = runValidation(ocrResult.designNumber);
            if (validation.isValid) {
              record.extractedDesignNumber = validation.normalized;
              record.confidence = ocrResult.confidence;
              
              // Map initial status based on confidence
              if (record.confidence >= 95) {
                record.status = "success";
              } else if (record.confidence >= 80) {
                record.status = "manual-review";
              } else {
                record.status = "failed";
                record.errorDetails = `Confidence score ${record.confidence}% is below 80%.`;
              }
            } else {
              record.status = "failed";
              record.errorDetails = validation.error || "Failed regex validation.";
            }
          } else {
            record.status = "failed";
            record.errorDetails = "No design number pattern detected by OCR.";
          }
        } else {
          record.status = "error";
          record.errorDetails = `OCR process failed after 2 attempts. Error: ${ocrError?.message || "Unknown"}`;
        }
      } catch (err: any) {
        record.status = "error";
        record.errorDetails = `Failed during preprocessing/loading: ${err.message}`;
      }

      completedCount++;
      if (completedCount % 5 === 0 || completedCount === products.length) {
        console.log(`  [Progress] processed ${completedCount}/${products.length} products...`);
      }

      return record;
    };

    // Execute using concurrency limit
    const pool: Promise<MigrationRecord>[] = [];
    const results: MigrationRecord[] = [];

    for (const product of products) {
      const p = processProduct(product).then((res) => {
        // Remove from pool
        pool.splice(pool.indexOf(p), 1);
        results.push(res);
        return res;
      });
      pool.push(p);

      if (pool.length >= OCR_CONCURRENCY) {
        await Promise.race(pool);
      }
    }
    // Wait for remaining
    await Promise.all(pool);

    // Step 4: Duplicate Detection
    console.log("\n🔍 Analyzing results for duplicate design numbers...");
    const designNumberCounts: Record<string, number> = {};
    for (const r of results) {
      if (r.extractedDesignNumber && (r.status === "success" || r.status === "manual-review")) {
        designNumberCounts[r.extractedDesignNumber] = (designNumberCounts[r.extractedDesignNumber] || 0) + 1;
      }
    }

    const duplicates = Object.keys(designNumberCounts).filter((k) => designNumberCounts[k] > 1);
    
    if (duplicates.length > 0) {
      console.log(`  ⚠️ Found ${duplicates.length} duplicate design numbers! Updates will be halted for these products.`);
      for (const r of results) {
        if (r.extractedDesignNumber && duplicates.includes(r.extractedDesignNumber)) {
          r.status = "duplicate";
          r.errorDetails = `Duplicate design number detected: ${r.extractedDesignNumber}`;
        }
      }
    } else {
      console.log("  ✅ No duplicate design numbers detected.");
    }

    // Step 5: Update database for approved records
    console.log("\n💾 Executing database updates...");
    let successCount = 0;
    let manualReviewCount = 0;
    let failedCount = 0;
    let duplicateCount = 0;
    let errorCount = 0;
    let confidenceSum = 0;
    let confidenceCount = 0;
    let highestConfidence = 0;
    let lowestConfidence = 100;

    for (const r of results) {
      if (r.confidence > 0) {
        confidenceSum += r.confidence;
        confidenceCount++;
        if (r.confidence > highestConfidence) highestConfidence = r.confidence;
        if (r.confidence < lowestConfidence) lowestConfidence = r.confidence;
      }

      if (r.status === "success" && r.extractedDesignNumber) {
        try {
          await db.updateProductTitle(r.productId, r.extractedDesignNumber);
          successCount++;
        } catch (dbErr: any) {
          r.status = "error";
          r.errorDetails = `Database write failure: ${dbErr.message}`;
          errorCount++;
        }
      } else if (r.status === "manual-review") {
        manualReviewCount++;
      } else if (r.status === "failed") {
        failedCount++;
      } else if (r.status === "duplicate") {
        duplicateCount++;
      } else if (r.status === "error") {
        errorCount++;
      }
    }

    const endTime = new Date();
    const summary: MigrationSummary = {
      totalProducts: products.length,
      successCount,
      manualReviewCount,
      failedCount,
      duplicateCount,
      errorCount,
      startTime,
      endTime,
      confidenceStats: {
        average: confidenceCount > 0 ? confidenceSum / confidenceCount : 0,
        highest: highestConfidence,
        lowest: confidenceCount > 0 ? lowestConfidence : 0,
      },
    };

    // Step 6: Generate report
    ReportGenerator.generate(summary, results);

    console.log("\n==================================================");
    console.log("✨ MIGRATION SUMMARY");
    console.log("==================================================");
    console.log(`  Total Products Scanned: ${summary.totalProducts}`);
    console.log(`  Successfully Updated  : ${summary.successCount}`);
    console.log(`  Manual Review Queue   : ${summary.manualReviewCount}`);
    console.log(`  Failed OCR            : ${summary.failedCount}`);
    console.log(`  Duplicate SKUs        : ${summary.duplicateCount}`);
    console.log(`  Errors                : ${summary.errorCount}`);
    console.log(`  Average Confidence    : ${summary.confidenceStats.average.toFixed(1)}%`);
    console.log("==================================================");
    console.log("Report generated at: scripts/ocr-migration/reports/migration-report.md\n");

  } catch (err: any) {
    console.error("❌ Migration orchestrator error:", err);
  } finally {
    await ocr.terminate();
    await db.disconnect();
  }
}

main().catch(console.error);
