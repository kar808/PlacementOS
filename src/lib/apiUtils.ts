/**
 * Utility functions for API request signing, validation, and request integrity checking.
 */

export function getCanonicalString(obj: any): string {
  if (obj === null || obj === undefined) return "null";
  if (typeof obj !== "object") {
    if (typeof obj === "string") {
      return `"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return String(obj);
  }
  if (Array.isArray(obj)) {
    return "[" + obj.map(getCanonicalString).join(",") + "]";
  }
  const keys = Object.keys(obj).sort();
  const parts = keys
    .map(k => {
      const val = obj[k];
      if (val === undefined) return null;
      return `"${k}":${getCanonicalString(val)}`;
    })
    .filter(p => p !== null);
  return "{" + parts.join(",") + "}";
}

export function computeRequestIntegrity(endpoint: string, body: any, timestamp: number, userId: string): string {
  const secret = (import.meta as any).env?.VITE_INTEGRITY_SECRET_KEY || "PlacementOS_Secure_Key_2026";
  const data = `${endpoint}:${getCanonicalString(body || {})}:${timestamp}:${userId}:${secret}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

export function safeJsonParse<T>(val: string | null | undefined, fallback: T): T {
  if (!val || val === "undefined" || val === "null" || val === "NaN") {
    return fallback;
  }
  try {
    const parsed = JSON.parse(val);
    return parsed !== undefined && parsed !== null ? parsed : fallback;
  } catch (e) {
    console.warn("[safeJsonParse] Caught JSON parse error, returning fallback:", e);
    return fallback;
  }
}

export function safeStorageGet<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return safeJsonParse<T>(item, fallback);
  } catch (e) {
    console.warn(`[safeStorageGet] Error reading key '${key}' from localStorage:`, e);
    return fallback;
  }
}

export function safeStorageSet(key: string, value: any): void {
  try {
    if (value === undefined) {
      localStorage.removeItem(key);
      return;
    }
    const serialized = JSON.stringify(value);
    if (serialized === "undefined" || serialized === "null") {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, serialized);
  } catch (e) {
    console.warn(`[safeStorageSet] Failed setting '${key}' in localStorage:`, e);
  }
}

