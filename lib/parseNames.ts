import { Person } from '@/types';

export const MIN_NAMES = 2;
export const MAX_NAMES = 20;
export const MAX_NAME_LENGTH = 50;

/**
 * Sanitize a name by removing potentially dangerous characters
 * and limiting length
 */
function sanitizeName(name: string): string {
  return name
    .replace(/[<>"'&]/g, '') // Remove HTML-unsafe characters
    .trim()
    .slice(0, MAX_NAME_LENGTH);
}

/**
 * Parse a string of names in various formats and extract clean names.
 *
 * Supported formats:
 * - Email format: "LastName, FirstName /XX/EXT <email@example.com>"
 * - Simple format: "John Doe" or just "John"
 * - Separators: semicolons (;) or newlines
 *
 * @param input - Raw input string containing names
 * @returns Array of Person objects with unique IDs
 */
export function parseNames(input: string): Person[] {
  if (!input.trim()) return [];

  // Split by semicolons or newlines
  const entries = input
    .split(/[;\n]/)
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0);

  const people: Person[] = [];
  const seenNames = new Set<string>();

  for (const entry of entries) {
    const rawName = extractName(entry);
    const name = rawName ? sanitizeName(rawName) : null;
    if (name && name.length > 0 && !seenNames.has(name.toLowerCase())) {
      seenNames.add(name.toLowerCase());
      people.push({
        id: generateId(),
        name,
        picked: false,
      });
    }
  }

  return people;
}

/**
 * Extract a clean name from various formats
 */
function extractName(entry: string): string | null {
  // Check for email format: "LastName, FirstName /XX/EXT <email>"
  // Pattern: captures "LastName, FirstName" before any "/" or "<"
  const emailFormatMatch = entry.match(/^([^,]+),\s*([^/<]+)/);

  if (emailFormatMatch) {
    const lastName = emailFormatMatch[1].trim();
    // Extract first name, removing any suffixes like /FR/EXT
    let firstName = emailFormatMatch[2].trim();
    // Remove trailing /XX or /XX/XXX patterns
    firstName = firstName.replace(/\s*\/[A-Z]+.*$/, '').trim();

    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
  }

  // Check for simple name with possible email in angle brackets
  const simpleWithEmail = entry.match(/^([^<]+)</);
  if (simpleWithEmail) {
    const name = simpleWithEmail[1].trim();
    // Remove any trailing /XX patterns
    const cleanName = name.replace(/\s*\/[A-Z]+.*$/, '').trim();
    if (cleanName) return cleanName;
  }

  // Just a plain name
  const plainName = entry.replace(/\s*\/[A-Z]+.*$/, '').trim();
  if (plainName && !plainName.includes('@')) {
    return plainName;
  }

  return null;
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Validate that we have a valid number of names.
 */
export function validateNameCount(count: number): { valid: boolean; message: string } {
  if (count < MIN_NAMES) {
    return { valid: false, message: `Please enter at least ${MIN_NAMES} names to start the game.` };
  }
  if (count > MAX_NAMES) {
    return { valid: false, message: `Wheel gets cramped over ${MAX_NAMES} names. Please remove some.` };
  }
  return { valid: true, message: '' };
}
