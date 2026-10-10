/**
 * Security & Data Sanitization Utilities
 * Protects against XSS, script injection, and corrupt inputs in local forms & storage.
 */

/**
 * Strips HTML tags and script elements from a string.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove any HTML tags
  let cleaned = input.replace(/<\/?[^>]+(>|$)/g, '');
  // Neutralize javascript: or data: URIs
  cleaned = cleaned.replace(/javascript:/gi, '').replace(/data:/gi, '');
  // Normalize whitespace
  return cleaned.trim();
}

/**
 * Validates and limits length of a string safely.
 */
export function sanitizeBoundedText(input: unknown, maxLength: number = 500): string {
  const sanitized = sanitizeText(input);
  return sanitized.slice(0, maxLength);
}

/**
 * Validates a number is within a finite safe range.
 */
export function sanitizeNumber(input: unknown, min: number, max: number, defaultValue: number): number {
  if (typeof input !== 'number' && typeof input !== 'string') {
    return defaultValue;
  }
  const parsed = Number(input);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return defaultValue;
  }
  return Math.min(Math.max(parsed, min), max);
}

/**
 * Validates JSON structure before restoring from backup.
 */
export function isValidBackupData(data: unknown): data is Record<string, any> {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  const obj = data as Record<string, any>;
  // Check that all keys start with sadaqah_ or are recognized app keys
  const keys = Object.keys(obj);
  if (keys.length === 0) return false;
  return keys.every((key) => typeof key === 'string' && (key.startsWith('sadaqah_') || key.startsWith('offline_') || key.startsWith('quran_')));
}
