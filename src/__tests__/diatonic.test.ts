import { describe, it, expect } from "vitest";
import { getDiatonicChords, getDiatonicChordNames } from "../index";

describe("getDiatonicChords (Rich Objects)", () => {
  it("should return correct diatonic chords and roman numerals for C Major", () => {
    const chords = getDiatonicChords("C", "Major");
    expect(chords.length).toBeGreaterThanOrEqual(7);

    const triads = chords.filter((c) => !c.isSeventh);
    expect(triads.map((c) => c.chord)).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
    expect(triads.map((c) => c.roman)).toEqual(["I", "ii", "iii", "IV", "V", "vi", "vii°"]);

    const sevenths = chords.filter((c) => c.isSeventh);
    expect(sevenths.map((c) => c.chord)).toEqual(["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"]);
  });

  it("should return correct diatonic chords for A Minor", () => {
    const chords = getDiatonicChords("A", "Minor");
    const triads = chords.filter((c) => !c.isSeventh);
    expect(triads.map((c) => c.chord)).toEqual(["Am", "Bdim", "C", "Dm", "Em", "F", "G"]);
    expect(triads.map((c) => c.roman)).toEqual(["i", "ii°", "III", "iv", "v", "VI", "VII"]);
  });

  it("should handle lowercase mode parameters", () => {
    const chordsMajor = getDiatonicChords("C", "major");
    expect(chordsMajor.filter((c) => !c.isSeventh).map((c) => c.chord)).toEqual([
      "C", "Dm", "Em", "F", "G", "Am", "Bdim"
    ]);

    const chordsMinor = getDiatonicChords("A", "minor");
    expect(chordsMinor.filter((c) => !c.isSeventh).map((c) => c.chord)).toEqual([
      "Am", "Bdim", "C", "Dm", "Em", "F", "G"
    ]);
  });

  it("should handle modal scales (Dorian, Mixolydian)", () => {
    const dorianChords = getDiatonicChords("D", "Dorian");
    expect(dorianChords.length).toBeGreaterThanOrEqual(7);
    const dorianTriads = dorianChords.filter((c) => !c.isSeventh);
    expect(dorianTriads[0].chord).toBe("Dm");
  });
});

describe("getDiatonicChordNames (String Array)", () => {
  it("should return correct diatonic chord names for C major (lowercase & TitleCase)", () => {
    expect(getDiatonicChordNames("C", "major")).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
    expect(getDiatonicChordNames("C", "Major")).toEqual(["C", "Dm", "Em", "F", "G", "Am", "Bdim"]);
  });

  it("should return correct diatonic chord names for A minor (lowercase & TitleCase)", () => {
    expect(getDiatonicChordNames("A", "minor")).toEqual(["Am", "Bdim", "C", "Dm", "Em", "F", "G"]);
    expect(getDiatonicChordNames("A", "Minor")).toEqual(["Am", "Bdim", "C", "Dm", "Em", "F", "G"]);
  });

  it("should support use7ths = true", () => {
    const sevenths = getDiatonicChordNames("C", "major", true);
    expect(sevenths).toEqual(["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"]);
  });
});
