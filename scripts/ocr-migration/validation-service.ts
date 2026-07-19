export interface ValidationResult {
  isValid: boolean;
  normalized: string | null;
  error?: string;
}

/**
 * Normalizes and extracts the design number from raw OCR text
 * e.g., "TL 2034", "TL2034", "TL_2034", "TL :2034" -> "TL-2034"
 */
export function extractAndNormalize(ocrText: string): string | null {
  if (!ocrText) return null;

  // Convert to uppercase for consistency
  const upperText = ocrText.toUpperCase().trim();

  // Look for 1-4 letters, followed by optional symbols/whitespace/colons, followed by 2-8 digits
  // Pattern: ([A-Z]{1,4})[\s:_#-]*([0-9]{2,8})
  const regex = /([A-Z]{1,4})[\s:_#-]*([0-9]{2,8})/;
  const match = upperText.match(regex);

  if (match) {
    const prefix = match[1];
    const number = match[2];
    return `${prefix}-${number}`;
  }

  return null;
}

/**
 * Validates a design number against the target pattern
 * Format: 1-4 uppercase letters, a hyphen, and 2-8 digits
 */
export function validateDesignNumber(designNumber: string | null): boolean {
  if (!designNumber) return false;
  
  // Normalized pattern check: e.g., "TL-2034"
  const regex = /^[A-Z]{1,4}-[0-9]{2,8}$/;
  return regex.test(designNumber);
}

/**
 * Checks a raw string and returns validation details
 */
export function runValidation(ocrText: string): ValidationResult {
  const normalized = extractAndNormalize(ocrText);
  
  if (!normalized) {
    return {
      isValid: false,
      normalized: null,
      error: "No matching design number pattern found in text.",
    };
  }

  const isValid = validateDesignNumber(normalized);

  return {
    isValid,
    normalized,
    error: isValid ? undefined : `Normalized string '${normalized}' failed validation regex format.`,
  };
}
