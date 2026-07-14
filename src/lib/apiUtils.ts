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
  const secret = "PlacementOS_Secure_Key_2026";
  const data = `${endpoint}:${getCanonicalString(body || {})}:${timestamp}:${userId}:${secret}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}
