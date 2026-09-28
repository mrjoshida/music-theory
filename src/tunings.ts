import type { TuningPreset, ValidateTuningOptions, ValidateTuningResult } from "./types";

/**
 * Standard and alternate tuning presets for fretted string instruments.
 *
 * Notes are standard MIDI numbers ordered from the lowest-positioned string upward
 * (not necessarily ascending in pitch; reentrant tunings are supported).
 * Presets for the same instrument are contiguous, so consumers can group them by `instrument` in array order.
 */
export const TUNING_PRESETS: readonly TuningPreset[] = [
  // Guitar
  {
    id: "guitar-standard",
    name: "Guitar Standard",
    instrument: "Guitar",
    notes: [40, 45, 50, 55, 59, 64],
  },
  {
    id: "guitar-eb-standard",
    name: "Eb Standard",
    instrument: "Guitar",
    notes: [39, 44, 49, 54, 58, 63],
  },
  {
    id: "guitar-d-standard",
    name: "D Standard",
    instrument: "Guitar",
    notes: [38, 43, 48, 53, 57, 62],
  },
  {
    id: "guitar-c-standard",
    name: "C Standard",
    instrument: "Guitar",
    notes: [36, 41, 46, 51, 55, 60],
  },
  {
    id: "guitar-b-standard",
    name: "B Standard (Baritone)",
    instrument: "Guitar",
    notes: [35, 40, 45, 50, 54, 59],
  },
  {
    id: "guitar-drop-d",
    name: "Drop D",
    instrument: "Guitar",
    notes: [38, 45, 50, 55, 59, 64],
  },
  {
    id: "guitar-double-drop-d",
    name: "Double Drop D",
    instrument: "Guitar",
    notes: [38, 45, 50, 55, 59, 62],
  },
  {
    id: "guitar-drop-c-sharp",
    name: "Drop C#",
    instrument: "Guitar",
    notes: [37, 44, 49, 54, 58, 63],
  },
  {
    id: "guitar-drop-c",
    name: "Drop C",
    instrument: "Guitar",
    notes: [36, 43, 48, 53, 57, 62],
  },
  {
    id: "guitar-drop-b",
    name: "Drop B",
    instrument: "Guitar",
    notes: [35, 42, 47, 52, 56, 61],
  },
  {
    id: "guitar-open-e",
    name: "Open E",
    instrument: "Guitar",
    notes: [40, 47, 52, 56, 59, 64],
  },
  {
    id: "guitar-open-d",
    name: "Open D",
    instrument: "Guitar",
    notes: [38, 45, 50, 54, 57, 62],
  },
  {
    id: "guitar-open-d-minor",
    name: "Open D Minor",
    instrument: "Guitar",
    notes: [38, 45, 50, 53, 57, 62],
  },
  {
    id: "guitar-open-g",
    name: "Open G",
    instrument: "Guitar",
    notes: [38, 43, 50, 55, 59, 62],
  },
  {
    id: "guitar-open-a",
    name: "Open A",
    instrument: "Guitar",
    notes: [40, 45, 52, 57, 61, 64],
  },
  {
    id: "guitar-open-c",
    name: "Open C",
    instrument: "Guitar",
    notes: [36, 43, 48, 55, 60, 64],
  },
  {
    id: "guitar-open-c6",
    name: "Open C6 (CACGCE)",
    instrument: "Guitar",
    notes: [36, 45, 48, 55, 60, 64],
  },
  {
    id: "guitar-dadgad",
    name: "DADGAD",
    instrument: "Guitar",
    notes: [38, 45, 50, 55, 57, 62],
  },
  {
    id: "guitar-facgce",
    name: "FACGCE",
    instrument: "Guitar",
    notes: [41, 45, 48, 55, 60, 64],
  },
  {
    id: "guitar-all-fourths",
    name: "All Fourths",
    instrument: "Guitar",
    notes: [40, 45, 50, 55, 60, 65],
  },
  {
    id: "guitar-new-standard",
    name: "New Standard (CGDAEG)",
    instrument: "Guitar",
    notes: [36, 43, 50, 57, 64, 67],
  },
  // Bass
  {
    id: "bass-eadg",
    name: "Bass EADG",
    instrument: "Bass",
    notes: [28, 33, 38, 43],
  },
  {
    id: "bass-drop-d",
    name: "Bass Drop D",
    instrument: "Bass",
    notes: [26, 33, 38, 43],
  },
  {
    id: "bass-5-string-beadg",
    name: "5-String Bass BEADG",
    instrument: "Bass",
    notes: [23, 28, 33, 38, 43],
  },
  {
    id: "bass-6-string-beadgc",
    name: "6-String Bass BEADGC",
    instrument: "Bass",
    notes: [23, 28, 33, 38, 43, 48],
  },
  // Other instruments
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
    id: "irish-bouzouki-gdad",
    name: "Irish Bouzouki GDAD",
    instrument: "Irish Bouzouki",
    notes: [43, 50, 57, 62],
  },
  {
    id: "ukulele-standard",
    name: "Ukulele GCEA (reentrant)",
    instrument: "Ukulele",
    notes: [67, 60, 64, 69],
  },
  {
    id: "ukulele-low-g",
    name: "Ukulele GCEA (low G)",
    instrument: "Ukulele",
    notes: [55, 60, 64, 69],
  },
  {
    id: "ukulele-d-tuning",
    name: "Ukulele ADF#B (reentrant)",
    instrument: "Ukulele",
    notes: [69, 62, 66, 71],
  },
  {
    id: "baritone-ukulele-dgbe",
    name: "Baritone Ukulele DGBE",
    instrument: "Baritone Ukulele",
    notes: [50, 55, 59, 64],
  },
  {
    id: "guitalele-adgcea",
    name: "Guitalele ADGCEA",
    instrument: "Guitalele",
    notes: [45, 50, 55, 60, 64, 69],
  },
  {
    id: "resonator-open-g",
    name: "Dobro Open G (GBDGBD)",
    instrument: "Resonator Guitar",
    notes: [43, 47, 50, 55, 59, 62],
  },
  {
    id: "cigar-box-3-open-g",
    name: "Cigar Box Guitar (3-String Open G)",
    instrument: "Cigar Box Guitar",
    notes: [43, 50, 55],
  },
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
