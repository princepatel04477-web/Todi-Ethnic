import { OcrService } from "./ocr-service";
import { runValidation } from "./validation-service";
import { join } from "path";
import { existsSync } from "fs";

async function main() {
  console.log("🧪 Starting OCR dry-run test on sample local images...");

  const ocr = new OcrService();
  await ocr.init();

  const testImages = [
    join(process.cwd(), "Products_Photos", "Bridal_Photos", "6332.jpeg_202606302100.jpeg"),
    join(process.cwd(), "Products_Photos", "Bridal_Photos", "6333.jpeg_202606302100.jpeg"),
  ];

  for (const imgPath of testImages) {
    console.log(`\n--------------------------------------------------`);
    console.log(`🔍 Processing test image: ${imgPath}`);
    
    if (!existsSync(imgPath)) {
      console.error(`❌ Image not found at: ${imgPath}`);
      continue;
    }

    try {
      const start = Date.now();
      const result = await ocr.processImage(imgPath);
      const duration = ((Date.now() - start) / 1000).toFixed(2);
      
      console.log(`⏱️  OCR completed in ${duration}s`);
      console.log(`💬 Raw OCR Text snippet: ${result.rawText.replace(/\n/g, " ").substring(0, 100)}...`);
      console.log(`🎯 Extracted design number: '${result.designNumber}'`);
      console.log(`📈 Confidence: ${result.confidence}%`);
      console.log(`🛠️  Attempts:`);
      result.attempts.forEach((a, idx) => console.log(`   ${idx + 1}. ${a}`));

      if (result.designNumber) {
        const validation = runValidation(result.designNumber);
        console.log(`✅ Validation status: ${validation.isValid ? "VALID" : "INVALID"}`);
        if (!validation.isValid) {
          console.error(`❌ Validation Error: ${validation.error}`);
        }
      } else {
        console.warn(`⚠️ No design number extracted from this image.`);
      }
    } catch (err: any) {
      console.error(`❌ Error processing image: ${err.message}`);
    }
  }

  await ocr.terminate();
  console.log(`\n🧪 Test execution completed.`);
}

main().catch(console.error);
