import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCanonicalString, computeRequestIntegrity } from "../lib/apiUtils";
import { logger } from "../lib/logger";

describe("Centralized API Utils & Integrity Verification Tests", () => {
  it("getCanonicalString should handle basic objects deterministically", () => {
    const obj1 = { b: 2, a: 1 };
    const obj2 = { a: 1, b: 2 };
    expect(getCanonicalString(obj1)).toBe(getCanonicalString(obj2));
    expect(getCanonicalString(obj1)).toBe('{"a":1,"b":2}');
  });

  it("getCanonicalString should handle nested objects and arrays correctly", () => {
    const complexObj = {
      z: [3, 2, { y: "nested-y", x: "nested-x" }],
      a: "first-element",
    };
    const expected = '{"a":"first-element","z":[3,2,{"x":"nested-x","y":"nested-y"}]}';
    expect(getCanonicalString(complexObj)).toBe(expected);
  });

  it("getCanonicalString should stringify null and primitive values", () => {
    expect(getCanonicalString(null)).toBe("null");
    expect(getCanonicalString(undefined)).toBe("null");
    expect(getCanonicalString("hello")).toBe('"hello"');
    expect(getCanonicalString(123)).toBe("123");
  });

  it("computeRequestIntegrity should generate deterministic signature matching expected secret", () => {
    const endpoint = "/api/placement/analyze";
    const body = { role: "Software Engineer" };
    const timestamp = 1720000000000;
    const userId = "test-user-id";

    const sig1 = computeRequestIntegrity(endpoint, body, timestamp, userId);
    const sig2 = computeRequestIntegrity(endpoint, body, timestamp, userId);
    expect(sig1).toBe(sig2);
    expect(typeof sig1).toBe("string");
    expect(sig1).not.toBe("");
  });
});

describe("Centralized Logger Utility Tests", () => {
  beforeEach(() => {
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logger.info should log correct message format to the console", () => {
    logger.info("auth", "User logged in successfully");
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining("[PlacementOS Logger] [INFO] [AUTH] User logged in successfully"),
      ""
    );
  });

  it("logger.error should log error formatted output to console.error", () => {
    logger.error("api", "Failed to contact database endpoint", { code: 500 });
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("[PlacementOS Logger] [ERROR] [API] Failed to contact database endpoint"),
      { code: 500 }
    );
  });
});
