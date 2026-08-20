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
    const tonicWithOct = `${root}${octave}`;
    return (fallback.intervals || ["1P", "2M", "3M", "4P", "5P", "6M", "7M"]).map((interval) =>
      Note.transpose(tonicWithOct, interval)
    );
  }

  const tonicWithOct = `${scaleData.tonic || root}${octave}`;
  return scaleData.intervals.map((interval) => Note.transpose(tonicWithOct, interval));
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

