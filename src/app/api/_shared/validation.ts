/**
 * Sanitizes user-provided string inputs to prevent command/prompt injection
 * by removing control characters and limiting length.
 *
 * @param input - The raw input string.
 * @param maxLength - Maximum permitted character count.
 * @returns Sanitized, safe string.
 */
export function sanitizeInput(
  input: string | undefined,
  maxLength: number,
): string {
  return String(input ?? '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .slice(0, maxLength);
}
