import { Key, Scale, Chord, Mode } from "tonal";
import type { DiatonicChord } from "./types";
import {
  ROMAN_NUMERALS_MAJOR,
  ROMAN_NUMERALS_MINOR,
  ROMAN_7TH_MAJOR,
  ROMAN_7TH_MINOR
} from "./constants";

/**
 * Derives rich diatonic triads and 7th chords for a given root and mode.
 * Returns DiatonicChord[] with { chord, roman, isSeventh }.
 * Normalizes mode case-insensitively.
 */
export function getDiatonicChords(root: string, mode: string): DiatonicChord[] {
  const normalizedMode = mode.toLowerCase();

  try {
    if (normalizedMode === "major") {
      const keyData = Key.majorKey(root);
      if (keyData && keyData.triads && keyData.triads.length === 7) {
        const triads = keyData.triads.map((ch, idx) => ({
          chord: ch,
          roman: ROMAN_NUMERALS_MAJOR[idx] || `Degree ${idx + 1}`,
          isSeventh: false,
        }));
        const sevenths = keyData.chords.map((ch, idx) => ({
          chord: ch,
          roman: ROMAN_7TH_MAJOR[idx] || `${ROMAN_NUMERALS_MAJOR[idx]}7`,
          isSeventh: true,
        }));
        return [...triads, ...sevenths];
      }
    } else if (normalizedMode === "minor") {
      const keyData = Key.minorKey(root);
      if (keyData && keyData.natural && keyData.natural.triads) {
        const triads = keyData.natural.triads.map((ch, idx) => ({
          chord: ch,
          roman: ROMAN_NUMERALS_MINOR[idx] || `Degree ${idx + 1}`,
          isSeventh: false,
        }));
        const sevenths = keyData.natural.chords.map((ch, idx) => ({
          chord: ch,
          roman: ROMAN_7TH_MINOR[idx] || `${ROMAN_NUMERALS_MINOR[idx]}7`,
          isSeventh: true,
        }));
        return [...triads, ...sevenths];
      }
    }

    // Modal fallback (Dorian, Phrygian, Lydian, Mixolydian, Locrian)
    const modeTriads = Mode.triads(normalizedMode, root);
    if (modeTriads && modeTriads.length >= 7) {
      const triads = modeTriads.slice(0, 7).map((ch, idx) => ({
        chord: ch,
        roman: `Degree ${idx + 1}`,
        isSeventh: false,
      }));
      const mode7ths = Mode.seventhChords(normalizedMode, root);
      const sevenths = (mode7ths && mode7ths.length >= 7 ? mode7ths.slice(0, 7) : []).map((ch, idx) => ({
        chord: ch,
        roman: `Degree ${idx + 1} (7th)`,
        isSeventh: true,
      }));
      return [...triads, ...sevenths];
    }
  } catch (e) {
    console.warn("Error computing diatonic chords:", e);
  }

  // General fallback for root note
  return [
    { chord: root, roman: "I", isSeventh: false },
    { chord: `${root}m`, roman: "i", isSeventh: false },
    { chord: `${root}7`, roman: "V7", isSeventh: true },
  ];
}

const diatonicChordsCache: Record<string, string[]> = {};

/**
 * Returns simple array of chord name strings for a key and mode (e.g. ["C", "Dm", "Em", ...]).
 * Accepts optional use7ths flag (default false).
 * Normalizes mode case-insensitively.
 */
export function getDiatonicChordNames(key: string, mode: string, use7ths: boolean = false): string[] {
  const normalizedMode = mode.toLowerCase();
  const cacheKey = `${key}:${normalizedMode}:${use7ths}`;
  if (diatonicChordsCache[cacheKey]) {
    return diatonicChordsCache[cacheKey];
  }

  const scaleName = `${key} ${normalizedMode}`;
  const scaleData = Scale.get(scaleName);
  if (scaleData.empty) return [];

  const notes = scaleData.notes;
  const numNotes = notes.length;

  const result = notes.map((note, i) => {
    const root = notes[i];
    const third = notes[(i + 2) % numNotes];
    const fifth = notes[(i + 4) % numNotes];

    const chordNotes = [root, third, fifth];
    if (use7ths) {
      const seventh = notes[(i + 6) % numNotes];
      chordNotes.push(seventh);
    }

    const detected = Chord.detect(chordNotes);
    return (detected[0] || `${root}`).replace(/M$/, "");
  });

  diatonicChordsCache[cacheKey] = result;
  return result;
}
