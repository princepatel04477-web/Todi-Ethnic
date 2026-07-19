import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

export interface MigrationRecord {
  productId: string;
  originalTitle: string;
  sku: string;
  imageUrl: string;
  localPath?: string;
  extractedDesignNumber: string | null;
  confidence: number;
  status: "success" | "manual-review" | "failed" | "duplicate" | "error";
  errorDetails?: string;
  attempts?: string[];
}

export interface MigrationSummary {
  totalProducts: number;
  successCount: number;
  manualReviewCount: number;
  failedCount: number;
  duplicateCount: number;
  errorCount: number;
  startTime: Date;
  endTime: Date;
  confidenceStats: {
    average: number;
    highest: number;
    lowest: number;
  };
}

export class ReportGenerator {
  /**
   * Generates a markdown report and JSON listings
   */
  static generate(summary: MigrationSummary, records: MigrationRecord[]): void {
    const reportDir = join(__dirname, "reports");
    if (!existsSync(reportDir)) {
      mkdirSync(reportDir, { recursive: true });
    }

    const durationMs = summary.endTime.getTime() - summary.startTime.getTime();
    const durationSec = (durationMs / 1000).toFixed(1);

    // Filter different categories
    const successList = records.filter((r) => r.status === "success");
    const manualReviewList = records.filter((r) => r.status === "manual-review");
    const failedList = records.filter((r) => r.status === "failed");
    const duplicateList = records.filter((r) => r.status === "duplicate");
    const errorList = records.filter((r) => r.status === "error");

    // Write manual review JSON file
    writeFileSync(
      join(reportDir, "manual-review.json"),
      JSON.stringify(manualReviewList, null, 2),
      "utf8"
    );

    // Write duplicate report JSON file
    writeFileSync(
      join(reportDir, "duplicates.json"),
      JSON.stringify(duplicateList, null, 2),
      "utf8"
    );

    // Build markdown content
    let md = `# OCR Product Title Migration Report\n\n`;
    md += `Generated at: ${summary.endTime.toISOString()}\n`;
    md += `Processing Time: **${durationSec} seconds** (${(durationMs / 1000 / 60).toFixed(2)} minutes)\n\n`;

    md += `## Executive Summary\n\n`;
    md += `| Metric | Count | Percentage |\n`;
    md += `| :--- | :---: | :---: |\n`;
    md += `| **Total Products Scanned** | ${summary.totalProducts} | 100% |\n`;
    md += `| **Successfully Updated** | ${summary.successCount} | ${((summary.successCount / summary.totalProducts) * 100).toFixed(1)}% |\n`;
    md += `| **Manual Review Required** | ${summary.manualReviewCount} | ${((summary.manualReviewCount / summary.totalProducts) * 100).toFixed(1)}% |\n`;
    md += `| **Failed OCR (No SKU Found)** | ${summary.failedCount} | ${((summary.failedCount / summary.totalProducts) * 100).toFixed(1)}% |\n`;
    md += `| **Duplicate SKUs Detected** | ${summary.duplicateCount} | ${((summary.duplicateCount / summary.totalProducts) * 100).toFixed(1)}% |\n`;
    md += `| **Errors (Missing Files/DB Errors)** | ${summary.errorCount} | ${((summary.errorCount / summary.totalProducts) * 100).toFixed(1)}% |\n\n`;

    md += `## OCR Confidence Statistics\n\n`;
    md += `- **Average Confidence**: ${summary.confidenceStats.average.toFixed(1)}%\n`;
    md += `- **Highest Confidence**: ${summary.confidenceStats.highest}%\n`;
    md += `- **Lowest Confidence**: ${summary.confidenceStats.lowest}%\n\n`;

    if (duplicateList.length > 0) {
      md += `## ⚠️ Duplicate SKUs Detected (Skip Updates)\n\n`;
      md += `The following products produced duplicate design numbers. Automatic updates were stopped for these records to prevent blind overwrites:\n\n`;
      md += `| Product SKU | Original Title | Extracted design number | Confidence | Image URL |\n`;
      md += `| :--- | :--- | :---: | :---: | :--- |\n`;
      for (const r of duplicateList) {
        md += `| ${r.sku} | ${r.originalTitle} | **${r.extractedDesignNumber}** | ${r.confidence}% | [Image](${r.imageUrl}) |\n`;
      }
      md += `\n`;
    }

    if (manualReviewList.length > 0) {
      md += `## 📋 Manual Review Queue (Confidence 80%-95%)\n\n`;
      md += `These items have moderate OCR confidence or minor issues and must be manually verified. Details saved to \`reports/manual-review.json\`:\n\n`;
      md += `| Product SKU | Original Title | Extracted design number | Confidence | Image URL |\n`;
      md += `| :--- | :--- | :---: | :---: | :--- |\n`;
      for (const r of manualReviewList) {
        md += `| ${r.sku} | ${r.originalTitle} | **${r.extractedDesignNumber}** | ${r.confidence}% | [Image](${r.imageUrl}) |\n`;
      }
      md += `\n`;
    }

    if (failedList.length > 0) {
      md += `## ❌ Failed OCR (Confidence < 80% or No SKU Found)\n\n`;
      md += `Could not extract design numbers for these images. No database changes were made:\n\n`;
      md += `| Product SKU | Original Title | Last Attempt Details | Image URL |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      for (const r of failedList) {
        const lastErr = r.errorDetails || (r.attempts ? r.attempts[r.attempts.length - 1] : "OCR failed");
        md += `| ${r.sku} | ${r.originalTitle} | ${lastErr} | [Image](${r.imageUrl}) |\n`;
      }
      md += `\n`;
    }

    if (errorList.length > 0) {
      md += `## 🚨 Processing Errors\n\n`;
      md += `Network, missing file, or write errors encountered during migration:\n\n`;
      md += `| Product SKU | Original Title | Error message | Image URL |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      for (const r of errorList) {
        md += `| ${r.sku} | ${r.originalTitle} | ${r.errorDetails} | [Image](${r.imageUrl}) |\n`;
      }
      md += `\n`;
    }

    if (successList.length > 0) {
      md += `## ✅ Successfully Migrated Products\n\n`;
      md += `<details>\n<summary>Click to view all ${successList.length} successfully migrated products</summary>\n\n`;
      md += `| Product SKU | Original Title | New Title (design number) | Confidence | Image URL |\n`;
      md += `| :--- | :--- | :---: | :---: | :--- |\n`;
      for (const r of successList) {
        md += `| ${r.sku} | ${r.originalTitle} | **${r.extractedDesignNumber}** | ${r.confidence}% | [Image](${r.imageUrl}) |\n`;
      }
      md += `\n</details>\n\n`;
    }

    const reportPath = join(reportDir, "migration-report.md");
    writeFileSync(reportPath, md, "utf8");
    console.log(`\n📊 Migration Report successfully written to: ${reportPath}`);
  }
}
