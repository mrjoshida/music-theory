import type { TuningPreset, ValidateTuningOptions, ValidateTuningResult } from "./types";

/**
 * Standard and alternate tuning presets for fretted string instruments.
 *
 * Notes are standard MIDI numbers ordered from the lowest-positioned string upward
 * (not necessarily ascending in pitch; reentrant tunings are supported).
 */
export const TUNING_PRESETS: readonly TuningPreset[] = [
  {
    id: "guitar-standard",
    name: "Guitar Standard",
    instrument: "Guitar",
    notes: [40, 45, 50, 55, 59, 64],
  },
  {
    id: "guitar-drop-d",
    name: "Drop D",
    instrument: "Guitar",
    notes: [38, 45, 50, 55, 59, 64],
  },
  {
    id: "guitar-d-standard",
    name: "D Standard",
    instrument: "Guitar",
    notes: [38, 43, 48, 53, 57, 62],
  },
  {
    id: "guitar-eb-standard",
    name: "Eb Standard",
    instrument: "Guitar",
    notes: [39, 44, 49, 54, 58, 63],
  },
  {
    id: "guitar-dadgad",
    name: "DADGAD",
    instrument: "Guitar",
    notes: [38, 45, 50, 55, 57, 62],
  },
  {
    id: "guitar-open-g",
    name: "Open G",
    instrument: "Guitar",
    notes: [38, 43, 50, 55, 59, 62],
  },
  {
    id: "guitar-open-d",
    name: "Open D",
    instrument: "Guitar",
    notes: [38, 45, 50, 54, 57, 62],
  },
  {
    id: "guitar-open-e",
    name: "Open E",
    instrument: "Guitar",
    notes: [40, 47, 52, 56, 59, 64],
  },
  {
    id: "guitar-all-fourths",
    name: "All Fourths",
    instrument: "Guitar",
    notes: [40, 45, 50, 55, 60, 65],
  },
  {
    id: "bass-eadg",
    name: "Bass EADG",
    instrument: "Bass",
    notes: [28, 33, 38, 43],
  },
  {
    id: "tenor-banjo-cgda",
    name: "Tenor Banjo CGDA",
    instrument: "Tenor Banjo",
    notes: [48, 55, 62, 69],
  },
  {
    id: "tenor-banjo-irish",
    name: "Irish Tenor Banjo GDAE",
    instrument: "Tenor Banjo",
    notes: [43, 50, 57, 64],
  },
  {
    id: "plectrum-banjo-cgbd",
    name: "Plectrum Banjo CGBD",
    instrument: "Plectrum Banjo",
    notes: [48, 55, 59, 62],
  },
  {
    id: "mandolin-gdae",
    name: "Mandolin GDAE",
    instrument: "Mandolin",
    notes: [55, 62, 69, 76],
  },
  {
    id: "ukulele-standard",
    name: "Ukulele GCEA (reentrant)",
    instrument: "Ukulele",
    notes: [67, 60, 64, 69],
  },
  {
    id: "baritone-ukulele-dgbe",
    name: "Baritone Ukulele DGBE",
    instrument: "Baritone Ukulele",
    notes: [50, 55, 59, 64],
  },
  // Additional tunings from song-forge (1-6 fully fretted strings):
  // Source: song-forge/src/lib/types.ts (commonTunings: Double Drop D)
  {
    id: "guitar-double-drop-d",
    name: "Double Drop D",
    instrument: "Guitar",
    notes: [38, 45, 50, 55, 59, 62],
  },
  // Source: song-forge/src/lib/types.ts (commonTunings: Open C)
  {
    id: "guitar-open-c",
    name: "Open C",
    instrument: "Guitar",
    notes: [36, 43, 48, 55, 60, 64],
  },
  // Source: song-forge/src/lib/theory/instruments.ts (INSTRUMENT_PRESETS cigar-box-3)
  {
    id: "cigar-box-3-open-g",
    name: "Cigar Box Guitar (3-String Open G)",
    instrument: "Cigar Box Guitar",
    notes: [43, 50, 55],
  },
  // Source: song-forge/src/lib/theory/instruments.ts (INSTRUMENT_PRESETS cigar-box-4)
  {
    id: "cigar-box-4-open-g",
    name: "Cigar Box Guitar (4-String Open G)",
    instrument: "Cigar Box Guitar",
    notes: [43, 50, 55, 59],
  },
];

/**
 * Validates a candidate instrument tuning.
 *
 * Requirements:
 * - 1 to 6 strings.
 * - Integer MIDI numbers only.
 * - Each note >= 0.
 * - Each note + maxFret <= 127 (maxFret defaults to 14).
 *
 * @param notes - Array of open-string MIDI note numbers ordered lowest-positioned string upward.
 * @param opts - Options including optional maxFret (defaults to 14).
 * @returns { ok: true } on success, or { ok: false, errors: string[] } on validation failure.
 */
export function validateTuning(
  notes: number[],
  opts?: ValidateTuningOptions
): ValidateTuningResult {
  const maxFret = opts?.maxFret ?? 14;
  const errors: string[] = [];

  if (typeof maxFret !== "number" || !Number.isInteger(maxFret) || maxFret < 0) {
    errors.push(`maxFret must be a non-negative integer (received ${maxFret})`);
  }

  if (!Array.isArray(notes) || notes.length < 1 || notes.length > 6) {
    errors.push(
      `Tuning must have between 1 and 6 strings (received ${Array.isArray(notes) ? notes.length : 0})`
    );
  }

  if (Array.isArray(notes)) {
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      if (typeof note !== "number" || !Number.isInteger(note)) {
        errors.push(`String ${i + 1}: Note must be an integer (received ${note})`);
        continue;
      }
      if (note < 0) {
        errors.push(`String ${i + 1}: Note MIDI number must be >= 0 (received ${note})`);
      }
      if (note + maxFret > 127) {
        errors.push(
          `String ${i + 1}: Note (${note}) + maxFret (${maxFret}) exceeds MIDI maximum of 127 (was ${note + maxFret})`
        );
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return { ok: true };
}
