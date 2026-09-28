import { describe, it, expect } from "vitest";
import { TUNING_PRESETS, validateTuning } from "../index";

describe("TUNING_PRESETS", () => {
  it("every preset id is unique", () => {
    const ids = TUNING_PRESETS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every notes array is unique", () => {
    const noteStrings = TUNING_PRESETS.map((p) => p.notes.join(","));
    expect(new Set(noteStrings).size).toBe(noteStrings.length);
  });

  it("every preset passes validateTuning with ok: true", () => {
    for (const preset of TUNING_PRESETS) {
      expect(validateTuning(preset.notes)).toEqual({ ok: true });
    }
  });

  it("spot checks new presets by id with exact toEqual notes", () => {
    const facgce = TUNING_PRESETS.find((p) => p.id === "guitar-facgce");
    expect(facgce).toBeDefined();
    expect(facgce!.notes).toEqual([41, 45, 48, 55, 60, 64]);

    const bass5 = TUNING_PRESETS.find((p) => p.id === "bass-5-string-beadg");
    expect(bass5).toBeDefined();
    expect(bass5!.notes).toEqual([23, 28, 33, 38, 43]);

    const ukeD = TUNING_PRESETS.find((p) => p.id === "ukulele-d-tuning");
    expect(ukeD).toBeDefined();
    expect(ukeD!.notes).toEqual([69, 62, 66, 71]);

    const dobro = TUNING_PRESETS.find((p) => p.id === "resonator-open-g");
    expect(dobro).toBeDefined();
    expect(dobro!.notes).toEqual([43, 47, 50, 55, 59, 62]);
  });

  it("each instrument's presets are contiguous in the array", () => {
    const seenInstruments = new Set<string>();
    let currentInstrument: string | null = null;
    for (const preset of TUNING_PRESETS) {
      if (preset.instrument !== currentInstrument) {
        expect(seenInstruments.has(preset.instrument)).toBe(false);
        seenInstruments.add(preset.instrument);
        currentInstrument = preset.instrument;
      }
    }
  });

  it("starts with guitar-standard", () => {
    expect(TUNING_PRESETS[0].id).toBe("guitar-standard");
  });
});
