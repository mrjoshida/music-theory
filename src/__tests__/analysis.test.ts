import { describe, it, expect } from "vitest";
import {
  getRelatedKeys,
  getCircleNeighbors,
  analyzeProgression,
  analyzeChordRelationship
} from "../index";

describe("getRelatedKeys", () => {
  it("should return correct related keys for C major", () => {
    const related = getRelatedKeys("C", "major");
    expect(related).toContainEqual({ relationship: "Parallel Minor", key: "C", mode: "minor" });
    expect(related).toContainEqual({ relationship: "Relative Minor", key: "A", mode: "minor" });
    expect(related).toContainEqual({ relationship: "Dominant", key: "G", mode: "major" });
    expect(related).toContainEqual({ relationship: "Subdominant", key: "F", mode: "major" });
  });

  it("should return correct related keys for A minor (supports Title Case input)", () => {
    const related = getRelatedKeys("A", "Minor");
    expect(related).toContainEqual({ relationship: "Parallel Major", key: "A", mode: "major" });
    expect(related).toContainEqual({ relationship: "Relative Major", key: "C", mode: "major" });
    expect(related).toContainEqual({ relationship: "Dominant", key: "E", mode: "minor" });
    expect(related).toContainEqual({ relationship: "Subdominant", key: "D", mode: "minor" });
  });
});

describe("getCircleNeighbors", () => {
  it("should return correct Circle of 5ths neighbors for C major", () => {
    const neighbors = getCircleNeighbors("C", "major");
    expect(neighbors).toContainEqual({ key: "F", mode: "major", relationship: "IV" });
    expect(neighbors).toContainEqual({ key: "C", mode: "major", relationship: "I" });
    expect(neighbors).toContainEqual({ key: "G", mode: "major", relationship: "V" });
    expect(neighbors).toContainEqual({ key: "A", mode: "minor", relationship: "vi" });
    expect(neighbors).toContainEqual({ key: "D", mode: "minor", relationship: "ii" });
    expect(neighbors).toContainEqual({ key: "E", mode: "minor", relationship: "iii" });
  });
});

describe("analyzeProgression", () => {
  it("should detect C major scale for standard progression", () => {
    const analysis = analyzeProgression(["C", "G", "Am", "F"]);
    expect(analysis.suggestedScaleName).toBe("C major");
    expect(analysis.scaleTonic).toBe("C");
    expect(analysis.allChordNotes.length).toBeGreaterThanOrEqual(4);
  });

  it("should handle empty or single chord inputs gracefully", () => {
    const analysis = analyzeProgression(["C"]);
    expect(analysis.allChordNotes).toContain("C");
    expect(analysis.allChordNotes).toContain("E");
    expect(analysis.allChordNotes).toContain("G");
  });
});

describe("analyzeChordRelationship", () => {
  it("should identify diatonic roles in C major", () => {
    expect(analyzeChordRelationship("C", "C", "major")).toEqual({
      role: "Tonic",
      isDiatonic: true,
      alternatives: [],
    });
    expect(analyzeChordRelationship("F", "C", "major")).toEqual({
      role: "Pre-dom",
      isDiatonic: true,
      alternatives: [],
    });
    expect(analyzeChordRelationship("G", "C", "major")).toEqual({
      role: "Dom (Tense)",
      isDiatonic: true,
      alternatives: [],
    });
  });

  it("should identify borrowed chords (modal interchange)", () => {
    const result = analyzeChordRelationship("Fm", "C", "major");
    expect(result.isDiatonic).toBe(false);
    expect(result.role).toContain("Borrowed");
  });

  it("should identify secondary dominants", () => {
    const result = analyzeChordRelationship("A7", "C", "major");
    expect(result.isDiatonic).toBe(false);
    expect(result.role).toContain("Secondary Dominant V/ii");
  });

  it("should handle invalid chord gracefully", () => {
    const result = analyzeChordRelationship("InvalidChord", "C", "major");
    expect(result.isDiatonic).toBe(false);
  });
});
