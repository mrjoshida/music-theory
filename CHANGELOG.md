# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-09-25

### Added
- **Scale Pitch Classes** (`getScalePitchClasses`): Returns ordered pitch-class names (no octave) for any mode/scale. Added support for Harmonic Minor and Melodic Minor modes additively to `KEY_MODES` and `parseKey`.
- **Pitch Classification** (`classifyPitch`): Classifies pitch names or MIDI numbers against a diatonic chord built on a scale degree (0-indexed). Reports diatonic chord role (`root`, `third`, `fifth`, `seventh`), suspension role (`sus2` / `sus4` via true major 2nd and perfect 4th), and in-scale membership (`inScale`). Enharmonic-safe and robust to octave boundaries.
- **Modal Roman Numerals** (`getRomanNumeral`): Generates modal Roman numeral strings for triads and 7th chords with accidentals relative to the parallel major scale (e.g. Mixolydian degree 6 is `bVII`, Aeolian degree 5 is `bVI`). Suffixes `°` (diminished), `+` (augmented), `maj7`, `7`, `ø7` (half-diminished), and `°7` (fully diminished).
- **Suspended Chords** (`getSuspendedChord`): Generates `sus2` and `sus4` chord structures using true major 2nd and perfect 4th intervals from root.
- **Key-Aware MIDI Pitch Translation** (`midiToPitchInKey`): Translates MIDI note numbers (0-127) to scientific pitch strings with octave (C4 = 60), using scale spelling for in-scale notes, flats for chromatic notes in flat keys, and sharps in sharp keys.
- **Instrument Tunings Module** (`TUNING_PRESETS` & `validateTuning`):
  - 20 instrument tuning presets across Guitar, Bass, Banjo, Mandolin, Ukulele, and Cigar Box Guitar.
  - `validateTuning` utility enforcing 1-6 strings, integer MIDI numbers >= 0, and note + maxFret <= 127.

### Fixed
- Return empty array from `getScalePitchClasses` and `getScalePitchNotes` when root is invalid or unrecognized.
- Render `b5` modifier in `getRomanNumeral` for chords with major 3rd and diminished 5th (`b5`, `7b5`, `maj7b5`).
- Enforce non-negative integer validation on `maxFret` option in `validateTuning`.

## [0.1.0] - 2026-03-01

### Added
- Initial release with key/mode parsing, diatonic chord generation, and harmonic analysis tools.
