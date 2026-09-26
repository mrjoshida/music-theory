import type { ChordRole, SusRole, PitchClassification } from "./types";
import { Note, Scale } from "tonal";

/**
 * Normalizes mode name to lowercase standard format recognized by Tonal.
 */
function normalizeMode(mode: string): string {
  const m = mode.trim().toLowerCase();
  if (m === "aeolian (natural minor)" || m === "natural minor") return "aeolian";
  if (m === "ionian (major)") return "major";
  return m;
}

/**
 * Returns pitch strings (e.g., ["C4", "D4", "E4", ...]) for a given root, mode/scale, and octave.
 * Automatically handles octave boundary wrapping correctly (e.g. A4 major -> A4, B4, C#5, D5, E5, F#5, G#5).
 */
export function getScalePitchNotes(root: string, mode: string, octave: number = 4): string[] {
  const normMode = normalizeMode(mode);
  const scaleData = Scale.get(`${root} ${normMode}`);

  if (scaleData.empty || !scaleData.intervals || scaleData.intervals.length === 0) {
    // Fallback to major scale
    const fallback = Scale.get(`${root} major`);
    if (fallback.empty || !fallback.intervals || fallback.intervals.length === 0) {
      return [];
    }
    const tonicWithOct = `${fallback.tonic || root}${octave}`;
    return fallback.intervals
      .map((interval) => Note.transpose(tonicWithOct, interval))
      .filter(Boolean);
  }

  const tonicWithOct = `${scaleData.tonic || root}${octave}`;
  return scaleData.intervals
    .map((interval) => Note.transpose(tonicWithOct, interval))
    .filter(Boolean);
}

/**
 * Returns the exact pitch string for a scale degree (0-indexed).
 * Supports arbitrary positive and negative degrees with automatic octave arithmetic.
 */
export function getScaleDegreePitch(
  root: string,
  mode: string,
  degree: number,
  baseOctave: number = 4
): string {
  const baseScale = getScalePitchNotes(root, mode, baseOctave);
  if (baseScale.length === 0) return `${root}${baseOctave}`;

  const numNotes = baseScale.length;
  const octaveShift = Math.floor(degree / numNotes);
  const normalizedIndex = ((degree % numNotes) + numNotes) % numNotes;

  const basePitch = baseScale[normalizedIndex];
  if (octaveShift === 0) return basePitch;

  const semiShift = octaveShift * 12;
  const midi = Note.get(basePitch).midi;
  if (midi === null || midi === undefined || isNaN(midi)) {
    return basePitch;
  }
  const targetMidi = midi + semiShift;
  return Note.fromMidi(targetMidi) || basePitch;
}

/**
 * Returns an array of pitches forming a diatonic triad or 7th chord built upon a scale degree.
 */
export function getScaleDegreeChordPitches(
  root: string,
  mode: string,
  degree: number,
  baseOctave: number = 3,
  isSeventh: boolean = false
): string[] {
  const degrees = isSeventh
    ? [degree, degree + 2, degree + 4, degree + 6]
    : [degree, degree + 2, degree + 4];

  return degrees.map((deg) => getScaleDegreePitch(root, mode, deg, baseOctave));
}

/**
 * Converts a scientific pitch string (e.g., "C4", "A4", "F#3") to a standard MIDI note number (0-127).
 */
export function pitchToMidiNumber(pitch: string): number {
  const parsed = Note.get(pitch);
  if (parsed.midi !== null && parsed.midi !== undefined && !isNaN(parsed.midi)) {
    return Math.max(0, Math.min(127, parsed.midi));
  }
  return 60; // Default Middle C (C4)
}

/**
 * Converts a standard MIDI note number (0-127) to a scientific pitch string (e.g. "C4").
 */
export function midiNumberToPitch(midi: number): string {
  const clamped = Math.max(0, Math.min(127, Math.round(midi)));
  return Note.fromMidi(clamped) || "C4";
}

/**
 * Converts a scientific pitch string or MIDI note number to its exact frequency in Hz (A4 = 440Hz).
 */
export function pitchToFrequency(pitchOrMidi: string | number): number {
  if (typeof pitchOrMidi === "number") {
    return 440 * Math.pow(2, (pitchOrMidi - 69) / 12);
  }
  const freq = Note.freq(pitchOrMidi);
  if (freq !== null && freq !== undefined && !isNaN(freq)) {
    return freq;
  }
  const midi = pitchToMidiNumber(pitchOrMidi);
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/**
 * Returns ordered pitch-class names (e.g., ["C", "D", "E", "F", "G", "A", "B"]) for a given root and mode/scale.
 * Supports Major, Minor, church modes, Harmonic Minor, Melodic Minor, and other scales.
 */
export function getScalePitchClasses(root: string, mode: string): string[] {
  const normMode = normalizeMode(mode);
  const scaleData = Scale.get(`${root} ${normMode}`);

  if (scaleData.empty || !scaleData.intervals || scaleData.intervals.length === 0) {
    const fallback = Scale.get(`${root} major`);
    if (fallback.empty || !fallback.intervals || fallback.intervals.length === 0) {
      return [];
    }
    const tonicWithOct = `${fallback.tonic || root}4`;
    return fallback.intervals
      .map((interval) => Note.pitchClass(Note.transpose(tonicWithOct, interval)))
      .filter(Boolean);
  }

  const tonicWithOct = `${scaleData.tonic || root}4`;
  return scaleData.intervals
    .map((interval) => Note.pitchClass(Note.transpose(tonicWithOct, interval)))
    .filter(Boolean);
}

/**
 * Classifies a pitch (as note name or MIDI number) against a diatonic chord built on a scale degree.
 *
 * Degree indexing follows the repository convention: 0-indexed (0 = degree 1 / tonic, 1 = degree 2, etc.).
 * The chord is the diatonic seventh chord stacked in thirds on that degree (scale steps degree, +2, +4, +6).
 *
 * susRole is sus2 when the pitch class is the chord root + 2 semitones and sus4 when it is + 5 semitones:
 * TRUE major 2nd / perfect 4th, even when out of key.
 *
 * inScale indicates whether the pitch class belongs to the scale.
 *
 * MIDI numbers use mod 12; note names may carry octaves; comparison is chroma-based (enharmonic-safe).
 *
 * @param pcOrMidi - Note pitch string (e.g. "C4", "Db", "F#2") or MIDI note number (e.g. 60, 42).
 * @param root - Key root note (e.g. "C", "F#").
 * @param mode - Mode name (e.g. "Major", "Minor", "Dorian").
 * @param degree - 0-indexed scale degree (0 = I/i, 1 = ii, 2 = iii, ..., 6 = vii).
 * @returns Classification object with chordRole, susRole, and inScale.
 */
export function classifyPitch(
  pcOrMidi: string | number,
  root: string,
  mode: string,
  degree: number
): PitchClassification {
  const scalePcs = getScalePitchClasses(root, mode);
  const numNotes = scalePcs.length;
  if (numNotes === 0) {
    return { chordRole: null, susRole: null, inScale: false };
  }

  // Normalize degree with modulo to support any positive or negative integer
  const deg = ((degree % numNotes) + numNotes) % numNotes;

  // Determine chroma of the input pitch (0-11)
  let pitchChroma: number;
  if (typeof pcOrMidi === "number") {
    pitchChroma = ((Math.round(pcOrMidi) % 12) + 12) % 12;
  } else {
    const c = Note.chroma(pcOrMidi);
    if (c !== undefined && c !== null) {
      pitchChroma = c;
    } else {
      const num = Number(pcOrMidi);
      if (!isNaN(num)) {
        pitchChroma = ((Math.round(num) % 12) + 12) % 12;
      } else {
        return { chordRole: null, susRole: null, inScale: false };
      }
    }
  }

  // Check if pitch class is in scale (chroma comparison, enharmonic-safe)
  const scaleChromas = scalePcs.map((pc) => Note.chroma(pc));
  const inScale = scaleChromas.includes(pitchChroma);

  // Diatonic seventh chord stacked in thirds on degree: degree, +2, +4, +6
  const rootPc = scalePcs[deg];
  const thirdPc = scalePcs[(deg + 2) % numNotes];
  const fifthPc = scalePcs[(deg + 4) % numNotes];
  const seventhPc = scalePcs[(deg + 6) % numNotes];

  const rootChroma = Note.chroma(rootPc) ?? -1;
  const thirdChroma = Note.chroma(thirdPc) ?? -1;
  const fifthChroma = Note.chroma(fifthPc) ?? -1;
  const seventhChroma = Note.chroma(seventhPc) ?? -1;

  let chordRole: ChordRole = null;
  if (pitchChroma === rootChroma) {
    chordRole = "root";
  } else if (pitchChroma === thirdChroma) {
    chordRole = "third";
  } else if (pitchChroma === fifthChroma) {
    chordRole = "fifth";
  } else if (pitchChroma === seventhChroma) {
    chordRole = "seventh";
  }

  // susRole: TRUE major 2nd (chord root + 2 semitones) and perfect 4th (+ 5 semitones)
  let susRole: SusRole = null;
  const sus2Chroma = (rootChroma + 2) % 12;
  const sus4Chroma = (rootChroma + 5) % 12;
  if (pitchChroma === sus2Chroma) {
    susRole = "sus2";
  } else if (pitchChroma === sus4Chroma) {
    susRole = "sus4";
  }

  return { chordRole, susRole, inScale };
}

const CHROMATIC_SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CHROMATIC_FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

/**
 * Converts a standard MIDI note number (0-127) to a scientific pitch string with octave (C4 = 60),
 * respecting the spelling of the given key.
 *
 * In-scale pitch classes use the scale's spelling.
 * Out-of-scale pitch classes use flats in flat keys and sharps otherwise.
 *
 * @param midi - Standard MIDI note number.
 * @param root - Key root note (e.g. "F", "G", "C").
 * @param mode - Mode name (e.g. "Major", "Minor").
 * @returns Scientific pitch string with octave (e.g. "Bb4", "F#4", "Db4").
 */
export function midiToPitchInKey(midi: number, root: string, mode: string): string {
  const clamped = Math.max(0, Math.min(127, Math.round(midi)));
  const chroma = clamped % 12;
  const scalePcs = getScalePitchClasses(root, mode);

  // In-scale pitch classes use the scale's spelling
  const inScaleMatch = scalePcs.find((pc) => Note.chroma(pc) === chroma);

  let pc: string;
  if (inScaleMatch) {
    pc = inScaleMatch;
  } else {
    // Determine whether this key prefers flats or sharps
    const flatCount = scalePcs.filter((n) => n.includes("b")).length;
    const sharpCount = scalePcs.filter((n) => n.includes("#")).length;
    const isFlatKey = flatCount > sharpCount || (root.includes("b") && flatCount >= sharpCount);
    pc = isFlatKey ? CHROMATIC_FLATS[chroma] : CHROMATIC_SHARPS[chroma];
  }

  // Calculate correct octave where C4 = 60
  const baseOct = Math.floor(clamped / 12) - 1;
  let oct = baseOct;
  for (const testOct of [baseOct, baseOct - 1, baseOct + 1]) {
    if (Note.get(`${pc}${testOct}`).midi === clamped) {
      oct = testOct;
      break;
    }
  }

  return `${pc}${oct}`;
}
