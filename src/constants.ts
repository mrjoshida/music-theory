import type { ChordQuality } from "./types";

export const ROOT_NOTES = [
  "C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"
] as const;

export type RootNote = typeof ROOT_NOTES[number];

export const KEY_MODES = [
  "Major",
  "Minor",
  "Dorian",
  "Phrygian",
  "Lydian",
  "Mixolydian",
  "Locrian",
] as const;

export type KeyMode = typeof KEY_MODES[number];

export const CHORD_QUALITIES: readonly ChordQuality[] = [
  { label: "Major", suffix: "" },
  { label: "Minor", suffix: "m" },
  { label: "Dominant 7", suffix: "7" },
  { label: "Major 7", suffix: "maj7" },
  { label: "Minor 7", suffix: "m7" },
  { label: "Diminished", suffix: "dim" },
  { label: "Half-Diminished 7", suffix: "m7b5" },
  { label: "Augmented", suffix: "aug" },
  { label: "Suspended 2", suffix: "sus2" },
  { label: "Suspended 4", suffix: "sus4" },
  { label: "Add 9", suffix: "add9" },
  { label: "9th", suffix: "9" },
] as const;

export const ROMAN_NUMERALS_MAJOR = ["I", "ii", "iii", "IV", "V", "vi", "vii°"] as const;
export const ROMAN_NUMERALS_MINOR = ["i", "ii°", "III", "iv", "v", "VI", "VII"] as const;
export const ROMAN_7TH_MAJOR = ["Imaj7", "ii7", "iii7", "IVmaj7", "V7", "vi7", "viiø7"] as const;
export const ROMAN_7TH_MINOR = ["i7", "iiø7", "IIImaj7", "iv7", "v7", "VImaj7", "VII7"] as const;
