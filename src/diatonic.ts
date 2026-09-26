import { Key, Scale, Chord, Mode, Note } from "tonal";
import type { DiatonicChord, SuspendedChord } from "./types";
import { getScalePitchClasses } from "./notes";
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

/**
 * Computes the modal Roman numeral for a diatonic chord on a given scale degree.
 * Accidentals are relative to the parallel major scale (e.g. Mixolydian degree 6 = 'bVII', Aeolian degree 5 = 'bVI').
 *
 * Degree indexing follows the repository convention: 0-indexed (0 = degree 1 / tonic, 1 = degree 2, etc.).
 *
 * @param root - Key root note (e.g. "C", "A", "F#").
 * @param mode - Mode/scale name (e.g. "Major", "Minor", "Dorian", "Mixolydian", "Harmonic Minor").
 * @param degree - 0-indexed scale degree (0 = I/i, 1 = ii, ..., 6 = vii).
 * @param use7th - If true, returns 7th chord Roman numeral. Default false.
 * @returns Roman numeral string (e.g. "I", "ii", "bVII", "vii°", "Imaj7", "V7", "iiø7", "vii°7").
 */
export function getRomanNumeral(
  root: string,
  mode: string,
  degree: number,
  use7th: boolean = false
): string {
  const scale = getScalePitchClasses(root, mode);
  const majorScale = getScalePitchClasses(root, "major");
  const numNotes = scale.length;
  if (numNotes === 0) return "I";

  const deg = ((degree % numNotes) + numNotes) % numNotes;
  const chordRoot = scale[deg];
  const majorDeg = majorScale[deg % majorScale.length];

  const rootChroma = Note.chroma(chordRoot) ?? 0;
  const majorChroma = Note.chroma(majorDeg) ?? 0;
  const chromaDiff = ((rootChroma - majorChroma) % 12 + 12) % 12;

  let acc = "";
  if (chromaDiff === 11) {
    acc = "b";
  } else if (chromaDiff === 10) {
    acc = "bb";
  } else if (chromaDiff === 1) {
    acc = "#";
  } else if (chromaDiff === 2) {
    acc = "##";
  }

  const romanUpperList = ["I", "II", "III", "IV", "V", "VI", "VII"];
  const romanLowerList = ["i", "ii", "iii", "iv", "v", "vi", "vii"];
  const romanUpper = romanUpperList[deg % 7];
  const romanLower = romanLowerList[deg % 7];

  const third = scale[(deg + 2) % numNotes];
  const fifth = scale[(deg + 4) % numNotes];

  const thirdInterval = ((Note.chroma(third) ?? 0) - rootChroma + 12) % 12;
  const fifthInterval = ((Note.chroma(fifth) ?? 0) - rootChroma + 12) % 12;

  const isMinor3rd = thirdInterval === 3;
  const isMajor3rd = thirdInterval === 4;
  const isDim5th = fifthInterval === 6;
  const isPer5th = fifthInterval === 7;
  const isAug5th = fifthInterval === 8;

  if (!use7th) {
    if (isMajor3rd && isPer5th) return `${acc}${romanUpper}`;
    if (isMinor3rd && isPer5th) return `${acc}${romanLower}`;
    if (isMinor3rd && isDim5th) return `${acc}${romanLower}°`;
    if (isMajor3rd && isAug5th) return `${acc}${romanUpper}+`;
    if (isMajor3rd && isDim5th) return `${acc}${romanUpper}b5`;
    return isMinor3rd ? `${acc}${romanLower}` : `${acc}${romanUpper}`;
  } else {
    const seventh = scale[(deg + 6) % numNotes];
    const seventhInterval = ((Note.chroma(seventh) ?? 0) - rootChroma + 12) % 12;

    if (isMajor3rd && isPer5th) {
      if (seventhInterval === 11) return `${acc}${romanUpper}maj7`;
      if (seventhInterval === 10) return `${acc}${romanUpper}7`;
    }
    if (isMinor3rd && isPer5th) {
      if (seventhInterval === 10) return `${acc}${romanLower}7`;
      if (seventhInterval === 11) return `${acc}${romanLower}maj7`;
    }
    if (isMinor3rd && isDim5th) {
      if (seventhInterval === 10) return `${acc}${romanLower}ø7`;
      if (seventhInterval === 9) return `${acc}${romanLower}°7`;
    }
    if (isMajor3rd && isAug5th) {
      if (seventhInterval === 11) return `${acc}${romanUpper}+maj7`;
      if (seventhInterval === 10) return `${acc}${romanUpper}+7`;
    }
    if (isMajor3rd && isDim5th) {
      if (seventhInterval === 10) return `${acc}${romanUpper}7b5`;
      if (seventhInterval === 11) return `${acc}${romanUpper}maj7b5`;
    }
    return isMinor3rd ? `${acc}${romanLower}7` : `${acc}${romanUpper}7`;
  }
}

/**
 * Returns suspended chord definition using true major 2nd (M2) or perfect 4th (P4).
 *
 * @param root - Chord root note (e.g. "E", "C").
 * @param type - 'sus2' or 'sus4.
 * @returns Object with name and notes array.
 */
export function getSuspendedChord(root: string, type: "sus2" | "sus4"): SuspendedChord {
  const cleanRoot = Note.pitchClass(root) || root;
  const fifth = Note.transpose(cleanRoot, "5P");

  if (type === "sus2") {
    const second = Note.transpose(cleanRoot, "2M");
    return {
      name: `${cleanRoot}sus2`,
      notes: [cleanRoot, second, fifth],
    };
  } else {
    const fourth = Note.transpose(cleanRoot, "4P");
    return {
      name: `${cleanRoot}sus4`,
      notes: [cleanRoot, fourth, fifth],
    };
  }
}
