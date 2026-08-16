import { describe, it, expect } from "vitest";
import { parseKey, formatKey, ROOT_NOTES, KEY_MODES } from "../index";

describe("parseKey", () => {
  it("should parse standard key strings", () => {
    expect(parseKey("C")).toEqual({ root: "C", mode: "Major" });
    expect(parseKey("C Major")).toEqual({ root: "C", mode: "Major" });
    expect(parseKey("Am")).toEqual({ root: "A", mode: "Minor" });
    expect(parseKey("A Minor")).toEqual({ root: "A", mode: "Minor" });
    expect(parseKey("F#m")).toEqual({ root: "F#", mode: "Minor" });
    expect(parseKey("G Mixolydian")).toEqual({ root: "G", mode: "Mixolydian" });
  });

  it("should handle lowercase mode inputs correctly", () => {
    expect(parseKey("c major")).toEqual({ root: "C", mode: "Major" });
    expect(parseKey("a minor")).toEqual({ root: "A", mode: "Minor" });
    expect(parseKey("eb dorian")).toEqual({ root: "Eb", mode: "Dorian" });
  });

  it("should handle empty or invalid input with sensible defaults", () => {
    expect(parseKey("")).toEqual({ root: "C", mode: "Major" });
    expect(parseKey(undefined)).toEqual({ root: "C", mode: "Major" });
  });
});

describe("formatKey", () => {
  it("should format root and mode into a display string", () => {
    expect(formatKey("C", "Major")).toBe("C Major");
    expect(formatKey("A", "Minor")).toBe("A Minor");
    expect(formatKey("F#", "Dorian")).toBe("F# Dorian");
  });

  it("should format lowercase inputs cleanly", () => {
    expect(formatKey("c", "major")).toBe("C Major");
    expect(formatKey("a", "minor")).toBe("A Minor");
  });
});

describe("Constants", () => {
  it("should export ROOT_NOTES and KEY_MODES", () => {
    expect(ROOT_NOTES.length).toBeGreaterThanOrEqual(12);
    expect(KEY_MODES).toContain("Major");
    expect(KEY_MODES).toContain("Minor");
  });
});
