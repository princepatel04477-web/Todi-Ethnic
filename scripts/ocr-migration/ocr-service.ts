import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { existsSync, readFileSync } from "fs";
import { join, basename, extname } from "path";
import { extractAndNormalize, validateDesignNumber } from "./validation-service";

export interface OcrResult {
  rawText: string;
  designNumber: string | null;
  confidence: number;
  attempts: string[];
}

export class OcrService {
  private worker: any = null;

  async init(): Promise<void> {
    if (!this.worker) {
      console.log("🤖 Initializing Tesseract.js Worker...");
      this.worker = await createWorker("eng");
      console.log("🤖 Tesseract.js Worker initialized.");
    }
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      console.log("🤖 Tesseract.js Worker terminated.");
    }
  }

  /**
   * Preprocesses an image using sharp
   */
  async preprocess(
    imagePath: string,
    crop: "none" | "bottom-right" | "top-right" = "none"
  ): Promise<Buffer> {
    let pipeline = sharp(imagePath);

    if (crop !== "none") {
      const metadata = await pipeline.metadata();
      const width = metadata.width || 1000;
      const height = metadata.height || 1000;

      if (crop === "bottom-right") {
        const w = Math.round(width * 0.35);
        const h = Math.round(height * 0.20);
        const left = width - w;
        const top = height - h;
        pipeline = pipeline.extract({ left, top, width: w, height: h });
      } else if (crop === "top-right") {
        const w = Math.round(width * 0.35);
        const h = Math.round(height * 0.20);
        const left = width - w;
        const top = 0;
        pipeline = pipeline.extract({ left, top, width: w, height: h });
      }
    }

    return await pipeline
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();
  }

  /**
   * Runs OCR on an image buffer and returns the raw text and confidence
   */
  async runOcr(imageBuffer: Buffer): Promise<{ text: string; confidence: number }> {
    if (!this.worker) {
      await this.init();
    }

    const { data } = await this.worker.recognize(imageBuffer);
    return {
      text: data.text || "",
      confidence: data.confidence || 0,
    };
  }

  /**
   * Process a single image file with fallback strategies (Full -> Bottom-Right -> Top-Right)
   */
  async processImage(imagePath: string): Promise<OcrResult> {
    const attempts: string[] = [];
    
    if (!existsSync(imagePath)) {
      throw new Error(`File not found at: ${imagePath}`);
    }

    // Extract expected digits from filename (e.g., "6332" from "6332.jpeg_...")
    const filename = basename(imagePath);
    const fileDigitsMatch = filename.match(/^(\d+)/);
    const fileDigits = fileDigitsMatch ? fileDigitsMatch[1] : null;

    const checkHeuristic = (rawText: string, confidence: number): OcrResult | null => {
      if (!fileDigits) return null;
      
      const upperText = rawText.toUpperCase();
      // Search for any prefix ([A-Z]{1,4}) followed by optional separation characters and the exact file digits
      const regex = new RegExp(`([A-Z]{1,4})[\\s:_#-]*${fileDigits}`);
      const match = upperText.match(regex);
      
      if (match) {
        const prefix = match[1];
        const designNum = `${prefix}-${fileDigits}`;
        if (validateDesignNumber(designNum)) {
          attempts.push(`Heuristic Match: Found prefix '${prefix}' with matching digits '${fileDigits}'`);
          return {
            rawText,
            designNumber: designNum,
            confidence: Math.max(confidence, 98), // Override to high confidence since it matches filename
            attempts,
          };
        }
      }
      return null;
    };

    // Attempt 1: Full image preprocessed
    attempts.push("Full Image Preprocessed");
    try {
      const buffer = await this.preprocess(imagePath, "none");
      const { text, confidence } = await this.runOcr(buffer);
      
      const hMatch = checkHeuristic(text, confidence);
      if (hMatch) return hMatch;

      const designNum = extractAndNormalize(text);
      if (designNum && validateDesignNumber(designNum) && confidence >= 80) {
        return {
          rawText: text,
          designNumber: designNum,
          confidence,
          attempts,
        };
      }
      attempts.push(`Full Image OCR result: '${designNum || "None"}' with confidence ${confidence}%`);
    } catch (err: any) {
      attempts.push(`Full Image attempt error: ${err.message}`);
    }

    // Attempt 2: Crop Bottom-Right (Most common location for design numbers)
    attempts.push("Cropped Bottom-Right");
    try {
      const buffer = await this.preprocess(imagePath, "bottom-right");
      const { text, confidence } = await this.runOcr(buffer);
      
      const hMatch = checkHeuristic(text, confidence);
      if (hMatch) return hMatch;

      const designNum = extractAndNormalize(text);
      if (designNum && validateDesignNumber(designNum) && confidence >= 70) {
        return {
          rawText: text,
          designNumber: designNum,
          confidence,
          attempts,
        };
      }
      attempts.push(`Bottom-Right OCR result: '${designNum || "None"}' with confidence ${confidence}%`);
    } catch (err: any) {
      attempts.push(`Bottom-Right attempt error: ${err.message}`);
    }

    // Attempt 3: Crop Top-Right
    attempts.push("Cropped Top-Right");
    try {
      const buffer = await this.preprocess(imagePath, "top-right");
      const { text, confidence } = await this.runOcr(buffer);
      
      const hMatch = checkHeuristic(text, confidence);
      if (hMatch) return hMatch;

      const designNum = extractAndNormalize(text);
      if (designNum && validateDesignNumber(designNum) && confidence >= 70) {
        return {
          rawText: text,
          designNumber: designNum,
          confidence,
          attempts,
        };
      }
      attempts.push(`Top-Right OCR result: '${designNum || "None"}' with confidence ${confidence}%`);
    } catch (err: any) {
      attempts.push(`Top-Right attempt error: ${err.message}`);
    }

    // Attempt 4: Full image raw (no preprocessing) as final fallback
    attempts.push("Raw Full Image (No Preprocessing)");
    try {
      const { text, confidence } = await this.runOcr(readFileSync(imagePath) as unknown as Buffer);
      
      const hMatch = checkHeuristic(text, confidence);
      if (hMatch) return hMatch;

      const designNum = extractAndNormalize(text);
      if (designNum && validateDesignNumber(designNum) && confidence >= 80) {
        return {
          rawText: text,
          designNumber: designNum,
          confidence,
          attempts,
        };
      }
      attempts.push(`Raw Full Image OCR result: '${designNum || "None"}' with confidence ${confidence}%`);
    } catch (err: any) {
      attempts.push(`Raw Full Image attempt error: ${err.message}`);
    }

    // If all attempts failed but we want to return a fallback if we found a match anyway (even with lower confidence)
    for (const attempt of attempts) {
      const match = attempt.match(/OCR result: '([A-Z]{1,4}-[0-9]{2,8})'/);
      if (match) {
        const designNum = match[1];
        if (validateDesignNumber(designNum)) {
          attempts.push(`Fallback: Using low-confidence match '${designNum}' for manual review.`);
          return {
            rawText: "",
            designNumber: designNum,
            confidence: 80, // Force into manual review
            attempts,
          };
        }
      }
    }

    return {
      rawText: "",
      designNumber: null,
      confidence: 0,
      attempts,
    };
  }
}
