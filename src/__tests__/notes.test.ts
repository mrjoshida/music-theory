import { describe, it, expect } from "vitest";
import {
  getScalePitchNotes,
  getScaleDegreePitch,
  getScaleDegreeChordPitches,
  pitchToMidiNumber,
  midiNumberToPitch,
  pitchToFrequency
} from "../index";

describe("notes utilities", () => {
  it("generates correct scale pitch notes across octave boundaries", () => {
    const cMajor = getScalePitchNotes("C", "major", 4);
    expect(cMajor).toEqual(["C4", "D4", "E4", "F4", "G4", "A4", "B4"]);

    const aMajor = getScalePitchNotes("A", "major", 4);
    expect(aMajor).toEqual(["A4", "B4", "C#5", "D5", "E5", "F#5", "G#5"]);

    const dDorian = getScalePitchNotes("D", "dorian", 3);
    expect(dDorian).toEqual(["D3", "E3", "F3", "G3", "A3", "B3", "C4"]);
  });

  it("handles scale degree pitch lookups with multi-octave wrapping", () => {
    expect(getScaleDegreePitch("C", "major", 0, 4)).toBe("C4");
    expect(getScaleDegreePitch("C", "major", 2, 4)).toBe("E4");
    expect(getScaleDegreePitch("C", "major", 7, 4)).toBe("C5");
    expect(getScaleDegreePitch("C", "major", 9, 4)).toBe("E5");
    expect(getScaleDegreePitch("C", "major", -1, 4)).toBe("B3");
    expect(getScaleDegreePitch("C", "major", -7, 4)).toBe("C3");
  });

  it("builds diatonic chord pitches from scale degrees", () => {
    const triad = getScaleDegreeChordPitches("C", "major", 0, 3, false);
    expect(triad).toEqual(["C3", "E3", "G3"]);

    const seventh = getScaleDegreeChordPitches("C", "major", 0, 3, true);
    expect(seventh).toEqual(["C3", "E3", "G3", "B3"]);

    const iiSeventh = getScaleDegreeChordPitches("C", "major", 1, 3, true);
    expect(iiSeventh).toEqual(["D3", "F3", "A3", "C4"]);
  });

  it("converts between pitches and MIDI note numbers", () => {
    expect(pitchToMidiNumber("C4")).toBe(60);
    expect(pitchToMidiNumber("A4")).toBe(69);
    expect(pitchToMidiNumber("C-1")).toBe(0);
    expect(pitchToMidiNumber("G9")).toBe(127);

    expect(midiNumberToPitch(60)).toBe("C4");
    expect(midiNumberToPitch(69)).toBe("A4");
  });

  it("computes pitch frequencies correctly", () => {
    expect(Math.round(pitchToFrequency("A4"))).toBe(440);
    expect(Math.round(pitchToFrequency("A3"))).toBe(220);
    expect(Math.round(pitchToFrequency(69))).toBe(440);
  });
});
