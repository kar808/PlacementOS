/**
 * Vorynexa Centralized Input Sanitization & Anti-XSS Utility
 * Provides robust sanitization for strings, objects, and nested payloads
 * to prevent Cross-Site Scripting (XSS), script injection, and unsafe control sequences.
 */

// Escape map for high-risk characters
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
};

// Regex to detect script tags, inline event handlers, and javascript: protocols
const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript\s*:/gi,
  /data\s*:\s*text\/html/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
];

/**
 * Sanitizes a single string value by stripping dangerous scripts and escaping unsafe HTML entities.
 */
export function sanitizeString(val: string): string {
  if (!val || typeof val !== "string") return val;

  let cleaned = val;

  // 1. Neutralize control characters (except standard whitespace / newlines)
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // 2. Remove executable script patterns and javascript: URIs
  DANGEROUS_PATTERNS.forEach((pattern) => {
    cleaned = cleaned.replace(pattern, "");
  });

  // 3. HTML Entity Encode high-risk characters if string contains tag markers
  if (/[<>&"'/`]/.test(cleaned)) {
    cleaned = cleaned.replace(/[<>&"'/`]/g, (char) => HTML_ESCAPE_MAP[char] || char);
  }

  return cleaned.trim();
}

/**
 * Recursively sanitizes all string fields within an object, array, or primitive structure.
 */
export function sanitizeUserInput<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    return sanitizeString(data) as unknown as T;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeUserInput(item)) as unknown as T;
  }

  if (typeof data === "object") {
    const sanitizedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      // Preserve system-internal keys or base64 streams cleanly if needed, sanitize string values
      if (key === "fileData" && typeof value === "string" && value.startsWith("data:")) {
        sanitizedObj[key] = value; // Preserve base64 image data string intact
      } else {
        sanitizedObj[key] = sanitizeUserInput(value);
      }
    }
    return sanitizedObj as T;
  }

  return data;
}

/**
 * Specialized helper for user profile updates
 */
export function sanitizeProfileInput(profile: Record<string, any>): Record<string, any> {
  return sanitizeUserInput(profile);
}

/**
 * Specialized helper for interview candidate responses
 */
export function sanitizeInterviewResponse(response: string): string {
  return sanitizeString(response);
}

/**
 * Specialized helper for job search and strategy inputs
 */
export function sanitizeStrategyInput(input: Record<string, any>): Record<string, any> {
  return sanitizeUserInput(input);
}
