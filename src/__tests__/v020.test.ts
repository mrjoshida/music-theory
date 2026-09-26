import { describe, it, expect } from "vitest";
import {
  getScalePitchClasses,
  classifyPitch,
  getRomanNumeral,
  getSuspendedChord,
  midiToPitchInKey,
  validateTuning,
  TUNING_PRESETS,
  pitchToMidiNumber,
  parseKey,
} from "../index";

describe("v0.2.0 Additions", () => {
  describe("T1: getScalePitchClasses", () => {
    it("returns correct pitch classes for standard modes", () => {
      expect(getScalePitchClasses("C", "Major")).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
      expect(getScalePitchClasses("A", "Minor")).toEqual(["A", "B", "C", "D", "E", "F", "G"]);
      expect(getScalePitchClasses("D", "Dorian")).toEqual(["D", "E", "F", "G", "A", "B", "C"]);
    });

    it("returns correct pitch classes for harmonic minor", () => {
      expect(getScalePitchClasses("A", "harmonic minor")).toEqual(["A", "B", "C", "D", "E", "F", "G#"]);
      expect(getScalePitchClasses("C", "Harmonic Minor")).toEqual(["C", "D", "Eb", "F", "G", "Ab", "B"]);
    });

    it("returns correct pitch classes for melodic minor", () => {
      expect(getScalePitchClasses("A", "melodic minor")).toEqual(["A", "B", "C", "D", "E", "F#", "G#"]);
      expect(getScalePitchClasses("C", "Melodic Minor")).toEqual(["C", "D", "Eb", "F", "G", "A", "B"]);
    });

    it("parseKey supports Harmonic Minor and Melodic Minor", () => {
      expect(parseKey("A Harmonic Minor")).toEqual({ root: "A", mode: "Harmonic Minor" });
      expect(parseKey("c melodic minor")).toEqual({ root: "C", mode: "Melodic Minor" });
    });
  });

  describe("T2: classifyPitch (Golden Examples from plan 5.2)", () => {
    it("C major, degree ii (degree = 1, D minor): matches plan 5.2 golden pattern", () => {
      // E2..B2 (40-47):
      // E scale, F third, F# out, G scale, G# out, A fifth, A# out, B scale
      // C (48) is the seventh
      // susRole for E = sus2 and G = sus4

      // 40 (E2): in scale, not in diatonic 7th chord (D-F-A-C), sus2 of D
      expect(classifyPitch(40, "C", "Major", 1)).toEqual({
        chordRole: null,
        susRole: "sus2",
        inScale: true,
      });

      // 41 (F2): in scale, third of Dm7
      expect(classifyPitch(41, "C", "Major", 1)).toEqual({
        chordRole: "third",
        susRole: null,
        inScale: true,
      });

      // 42 (F#2): out of scale, not in chord, no sus
      expect(classifyPitch(42, "C", "Major", 1)).toEqual({
        chordRole: null,
        susRole: null,
        inScale: false,
      });

      // 43 (G2): in scale, not in chord, sus4 of D
      expect(classifyPitch(43, "C", "Major", 1)).toEqual({
        chordRole: null,
        susRole: "sus4",
        inScale: true,
      });

      // 44 (G#2): out of scale
      expect(classifyPitch(44, "C", "Major", 1)).toEqual({
        chordRole: null,
        susRole: null,
        inScale: false,
      });

      // 45 (A2): in scale, fifth of Dm7
      expect(classifyPitch(45, "C", "Major", 1)).toEqual({
        chordRole: "fifth",
        susRole: null,
        inScale: true,
      });

      // 46 (A#2): out of scale
      expect(classifyPitch(46, "C", "Major", 1)).toEqual({
        chordRole: null,
        susRole: null,
        inScale: false,
      });

      // 47 (B2): in scale, not in chord, no sus
      expect(classifyPitch(47, "C", "Major", 1)).toEqual({
        chordRole: null,
        susRole: null,
        inScale: true,
      });

      // 48 (C3): in scale, seventh of Dm7
      expect(classifyPitch(48, "C", "Major", 1)).toEqual({
        chordRole: "seventh",
        susRole: null,
        inScale: true,
      });
    });

    it("C major, degree iii (degree = 2, E minor): matches plan 5.2 golden pattern", () => {
      // E2..B2: E root; F inScale true with susRole null; F# inScale false with susRole 'sus2';
      // G third; G# out; A inScale true with susRole 'sus4'; A# out; B fifth.

      // 40 (E2): root of Em7
      expect(classifyPitch(40, "C", "Major", 2)).toEqual({
        chordRole: "root",
        susRole: null,
        inScale: true,
      });

      // 41 (F2): in scale, susRole null (semitone above E is m2, not true M2)
      expect(classifyPitch(41, "C", "Major", 2)).toEqual({
        chordRole: null,
        susRole: null,
        inScale: true,
      });

      // 42 (F#2): out of scale, susRole 'sus2' (true M2 above E)
      expect(classifyPitch(42, "C", "Major", 2)).toEqual({
        chordRole: null,
        susRole: "sus2",
        inScale: false,
      });

      // 43 (G2): third of Em7
      expect(classifyPitch(43, "C", "Major", 2)).toEqual({
        chordRole: "third",
        susRole: null,
        inScale: true,
      });

      // 44 (G#2): out of scale
      expect(classifyPitch(44, "C", "Major", 2)).toEqual({
        chordRole: null,
        susRole: null,
        inScale: false,
      });

      // 45 (A2): in scale, susRole 'sus4' (true P4 above E)
      expect(classifyPitch(45, "C", "Major", 2)).toEqual({
        chordRole: null,
        susRole: "sus4",
        inScale: true,
      });

      // 46 (A#2): out of scale
      expect(classifyPitch(46, "C", "Major", 2)).toEqual({
        chordRole: null,
        susRole: null,
        inScale: false,
      });

      // 47 (B2): fifth of Em7
      expect(classifyPitch(47, "C", "Major", 2)).toEqual({
        chordRole: "fifth",
        susRole: null,
        inScale: true,
      });
    });

    it("C major, degree vii (degree = 6, B diminished): F is the fifth", () => {
      // In B diminished (B-D-F-A), F is the fifth (diminished fifth)
      expect(classifyPitch("F", "C", "Major", 6)).toEqual({
        chordRole: "fifth",
        susRole: null,
        inScale: true,
      });
      expect(classifyPitch("B", "C", "Major", 6)).toEqual({
        chordRole: "root",
        susRole: null,
        inScale: true,
      });
      expect(classifyPitch("D", "C", "Major", 6)).toEqual({
        chordRole: "third",
        susRole: null,
        inScale: true,
      });
      expect(classifyPitch("A", "C", "Major", 6)).toEqual({
        chordRole: "seventh",
        susRole: null,
        inScale: true,
      });
    });

    it("handles note strings with octaves and enharmonics", () => {
      expect(classifyPitch("Gb2", "C", "Major", 1)).toEqual({
        chordRole: null,
        susRole: null,
        inScale: false,
      });
      expect(classifyPitch("B#2", "C", "Major", 1)).toEqual({
        chordRole: "seventh",
        susRole: null,
        inScale: true,
      });
    });
  });

  describe("T3: getRomanNumeral", () => {
    it("computes Major scale Roman numerals", () => {
      const triads = [0, 1, 2, 3, 4, 5, 6].map((deg) => getRomanNumeral("C", "Major", deg, false));
      expect(triads).toEqual(["I", "ii", "iii", "IV", "V", "vi", "vii°"]);

      const sevenths = [0, 1, 2, 3, 4, 5, 6].map((deg) => getRomanNumeral("C", "Major", deg, true));
      expect(sevenths).toEqual(["Imaj7", "ii7", "iii7", "IVmaj7", "V7", "vi7", "viiø7"]);
    });

    it("computes Dorian scale Roman numerals", () => {
      const triads = [0, 1, 2, 3, 4, 5, 6].map((deg) => getRomanNumeral("C", "Dorian", deg, false));
      expect(triads).toEqual(["i", "ii", "bIII", "IV", "v", "vi°", "bVII"]);

      const sevenths = [0, 1, 2, 3, 4, 5, 6].map((deg) => getRomanNumeral("C", "Dorian", deg, true));
      expect(sevenths).toEqual(["i7", "ii7", "bIIImaj7", "IV7", "v7", "viø7", "bVIImaj7"]);
    });

    it("computes Mixolydian scale Roman numerals", () => {
      const triads = [0, 1, 2, 3, 4, 5, 6].map((deg) => getRomanNumeral("C", "Mixolydian", deg, false));
      expect(triads).toEqual(["I", "ii", "iii°", "IV", "v", "vi", "bVII"]);

      const sevenths = [0, 1, 2, 3, 4, 5, 6].map((deg) => getRomanNumeral("C", "Mixolydian", deg, true));
      expect(sevenths).toEqual(["I7", "ii7", "iiiø7", "IVmaj7", "v7", "vi7", "bVIImaj7"]);
    });

    it("computes Aeolian (natural minor) scale Roman numerals", () => {
      const triads = [0, 1, 2, 3, 4, 5, 6].map((deg) => getRomanNumeral("C", "Aeolian", deg, false));
      expect(triads).toEqual(["i", "ii°", "bIII", "iv", "v", "bVI", "bVII"]);

      const sevenths = [0, 1, 2, 3, 4, 5, 6].map((deg) => getRomanNumeral("C", "Aeolian", deg, true));
      expect(sevenths).toEqual(["i7", "iiø7", "bIIImaj7", "iv7", "v7", "bVImaj7", "bVII7"]);
    });

    it("computes Harmonic Minor scale Roman numerals", () => {
      const triads = [0, 1, 2, 3, 4, 5, 6].map((deg) => getRomanNumeral("C", "Harmonic Minor", deg, false));
      expect(triads).toEqual(["i", "ii°", "bIII+", "iv", "V", "bVI", "vii°"]);

      const sevenths = [0, 1, 2, 3, 4, 5, 6].map((deg) => getRomanNumeral("C", "Harmonic Minor", deg, true));
      expect(sevenths).toEqual(["imaj7", "iiø7", "bIII+maj7", "iv7", "V7", "bVImaj7", "vii°7"]);
    });
  });

  describe("T4: getSuspendedChord", () => {
    it("generates true sus2 and sus4 chords", () => {
      expect(getSuspendedChord("E", "sus2")).toEqual({
        name: "Esus2",
        notes: ["E", "F#", "B"],
      });
      expect(getSuspendedChord("E", "sus4")).toEqual({
        name: "Esus4",
        notes: ["E", "A", "B"],
      });
      expect(getSuspendedChord("D", "sus2")).toEqual({
        name: "Dsus2",
        notes: ["D", "E", "A"],
      });
      expect(getSuspendedChord("D", "sus4")).toEqual({
        name: "Dsus4",
        notes: ["D", "G", "A"],
      });
      expect(getSuspendedChord("Bb", "sus2")).toEqual({
        name: "Bbsus2",
        notes: ["Bb", "C", "F"],
      });
      expect(getSuspendedChord("Bb", "sus4")).toEqual({
        name: "Bbsus4",
        notes: ["Bb", "Eb", "F"],
      });
    });
  });

  describe("T5: midiToPitchInKey", () => {
    it("handles prompt examples", () => {
      // 70 in F major -> 'Bb4'
      expect(midiToPitchInKey(70, "F", "Major")).toBe("Bb4");
      // 66 in G major -> 'F#4'
      expect(midiToPitchInKey(66, "G", "Major")).toBe("F#4");
      // 61 in F major -> 'Db4'
      expect(midiToPitchInKey(61, "F", "Major")).toBe("Db4");
    });

    it("uses sharps for chromatic notes in sharp keys", () => {
      expect(midiToPitchInKey(61, "G", "Major")).toBe("C#4");
      expect(midiToPitchInKey(63, "G", "Major")).toBe("D#4");
    });

    it("uses flats for chromatic notes in flat keys", () => {
      expect(midiToPitchInKey(63, "F", "Major")).toBe("Eb4");
      expect(midiToPitchInKey(68, "F", "Major")).toBe("Ab4");
    });
  });

  describe("T6: tunings and validateTuning", () => {
    it("all TUNING_PRESETS pass validateTuning", () => {
      expect(TUNING_PRESETS.length).toBeGreaterThanOrEqual(16);
      for (const preset of TUNING_PRESETS) {
        const result = validateTuning(preset.notes);
        expect(result).toEqual({ ok: true });
        expect(preset.notes.length).toBeGreaterThanOrEqual(1);
        expect(preset.notes.length).toBeLessThanOrEqual(6);
      }
    });

    it("spot checks tuning MIDI numbers against pitchToMidiNumber", () => {
      expect(pitchToMidiNumber("E2")).toBe(40);
      expect(pitchToMidiNumber("G4")).toBe(67);

      const guitar = TUNING_PRESETS.find((p) => p.id === "guitar-standard");
      expect(guitar).toBeDefined();
      expect(guitar!.notes).toEqual([40, 45, 50, 55, 59, 64]);

      const dropD = TUNING_PRESETS.find((p) => p.id === "guitar-drop-d");
      expect(dropD).toBeDefined();
      expect(dropD!.notes).toEqual([38, 45, 50, 55, 59, 64]);

      const uke = TUNING_PRESETS.find((p) => p.id === "ukulele-standard");
      expect(uke).toBeDefined();
      expect(uke!.notes).toEqual([67, 60, 64, 69]);
    });

    it("validateTuning rejects invalid inputs", () => {
      // Empty array
      const emptyRes = validateTuning([]);
      expect(emptyRes.ok).toBe(false);

      // 7 strings
      const sevenRes = validateTuning([40, 45, 50, 55, 59, 64, 69]);
      expect(sevenRes.ok).toBe(false);

      // Non-integers
      const floatRes = validateTuning([40.5, 45, 50]);
      expect(floatRes.ok).toBe(false);

      // 114 with default maxFret (14): 114 + 14 = 128 > 127
      const highRes = validateTuning([114]);
      expect(highRes.ok).toBe(false);

      // 113 with default maxFret (14): 113 + 14 = 127 <= 127
      const validHighRes = validateTuning([113]);
      expect(validHighRes.ok).toBe(true);

      // Negative note
      const negRes = validateTuning([-1, 40]);
      expect(negRes.ok).toBe(false);
    });
  });

  describe("v0.2.0 Review Regressions", () => {
    it("getScalePitchClasses returns empty array for invalid root input", () => {
      expect(getScalePitchClasses("Invalid", "Major")).toEqual([]);
      expect(getScalePitchClasses("ZZZ", "Minor")).toEqual([]);
      expect(classifyPitch(60, "Invalid", "Major", 0)).toEqual({
        chordRole: null,
        susRole: null,
        inScale: false,
      });
    });

    it("getRomanNumeral renders b5 modifier for chords with major 3rd and diminished 5th (triad and 7th)", () => {
      expect(getRomanNumeral("C", "locrian major", 0, false)).toBe("Ib5");
      expect(getRomanNumeral("C", "locrian major", 0, true)).toBe("I7b5");
      expect(getRomanNumeral("C", "persian", 0, true)).toBe("Imaj7b5");
    });

    it("validateTuning rejects negative or non-integer maxFret options", () => {
      const negResult = validateTuning([40, 45, 50, 55, 59, 64], { maxFret: -5 });
      expect(negResult.ok).toBe(false);
      expect(negResult.errors).toContain("maxFret must be a non-negative integer (received -5)");

      const floatResult = validateTuning([40, 45, 50, 55, 59, 64], { maxFret: 12.5 });
      expect(floatResult.ok).toBe(false);
      expect(floatResult.errors).toContain("maxFret must be a non-negative integer (received 12.5)");
    });
  });
});
