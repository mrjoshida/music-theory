# @mrjoshida/music-theory

A lightweight, robust TypeScript music theory and functional harmony library built on top of [Tonal](https://github.com/tonaljs/tonal). Powers songwriting and audio analysis tools across the FWDBIAS ecosystem (including Wellspring and Song Forge).

## Features

- **Key & Mode Parsing**: Case-tolerant parsing and formatting for musical keys and modes (Major, Minor, Dorian, Phrygian, Lydian, Mixolydian, Locrian, Harmonic Minor, Melodic Minor).
- **Scale Pitch Classes** (`getScalePitchClasses`): Ordered pitch-class names (no octave) for any key and mode.
- **Pitch Classification** (`classifyPitch`): Enharmonic-safe chord role (`root`, `third`, `fifth`, `seventh`), suspension role (`sus2`, `sus4`), and in-scale detection on any 0-indexed scale degree.
- **Modal Roman Numerals** (`getRomanNumeral`): Triad and 7th chord modal Roman numerals relative to parallel major (e.g. `bVII`, `bVImaj7`, `iiø7`, `vii°7`).
- **Suspended Chords** (`getSuspendedChord`): True M2/P4 suspended chord generation (`sus2`, `sus4`).
- **Key-Aware MIDI Translation** (`midiToPitchInKey`): Converts MIDI numbers to scientific pitch strings respecting key spelling.
- **Instrument Tunings** (`TUNING_PRESETS`, `validateTuning`): Comprehensive preset library and tuning validator for 1-6 fretted string instruments.
- **Diatonic Chord Generation**:
  - Rich object mode (`getDiatonicChords`): Returns triads and 7ths with Roman numerals (e.g. `I`, `ii`, `V7`, `viiø7`).
  - Fast string array mode (`getDiatonicChordNames`): Cached string array representations.
- **Harmonic Analysis**:
  - **Parent Scale Detection** (`analyzeProgression`): Identifies overarching tonal centers from chord sequences.
  - **Functional Analysis** (`analyzeChordRelationship`): Classifies chord function (Tonic, Pre-dominant, Dominant, Borrowed / Modal Interchange, Secondary Dominants like `V/ii`, Secondary Leading Tones `vii°/V`).
  - **Related Keys** (`getRelatedKeys`): Computes parallel, relative, dominant, subdominant, and modal interchange keys.
  - **Circle of Fifths** (`getCircleNeighbors`): Retrieves neighboring keys and functional relationships.
- **Strict TypeScript & Dual Builds**: Ships with full ESM and CommonJS bundles with TypeScript declarations.

---

## Installation

```bash
npm install github:mrjoshida/music-theory
```

---

## Quick Start

### 1. Key Parsing & Formatting

```typescript
import { parseKey, formatKey } from "@mrjoshida/music-theory";

parseKey("Am"); // { root: "A", mode: "Minor" }
parseKey("c# major"); // { root: "C#", mode: "Major" }
parseKey("G Mixolydian"); // { root: "G", mode: "Mixolydian" }

formatKey("F#", "dorian"); // "F# Dorian"
```

### 2. Diatonic Chords

```typescript
import { getDiatonicChords, getDiatonicChordNames } from "@mrjoshida/music-theory";

// Rich objects with Roman numerals and 7ths
const chords = getDiatonicChords("C", "Major");
// [
//   { chord: "C", roman: "I", isSeventh: false },
//   { chord: "Dm", roman: "ii", isSeventh: false },
//   ...,
//   { chord: "Cmaj7", roman: "Imaj7", isSeventh: true },
//   { chord: "G7", roman: "V7", isSeventh: true }
// ]

// Simple chord name strings
getDiatonicChordNames("C", "major");
// ["C", "Dm", "Em", "F", "G", "Am", "Bdim"]

getDiatonicChordNames("C", "major", true);
// ["Cmaj7", "Dm7", "Em7", "Fmaj7", "G7", "Am7", "Bm7b5"]
```

### 3. Progression Analysis & Parent Scales

```typescript
import { analyzeProgression } from "@mrjoshida/music-theory";

const analysis = analyzeProgression(["C", "G", "Am", "F"]);
// {
//   suggestedScaleName: "C major",
//   scaleTonic: "C",
//   scaleNotes: ["C", "D", "E", "F", "G", "A", "B"],
//   allChordNotes: ["C", "E", "G", "B", "D", "A", "F"]
// }
```

### 4. Functional Chord Relationships

```typescript
import { analyzeChordRelationship } from "@mrjoshida/music-theory";

// Diatonic
analyzeChordRelationship("C", "C", "major");
// { role: "Tonic", isDiatonic: true, alternatives: [] }

// Modal Interchange (Borrowed)
analyzeChordRelationship("Fm", "C", "major");
// { role: "Borrowed from minor", isDiatonic: false, alternatives: ["F"] }

// Secondary Dominant
analyzeChordRelationship("A7", "C", "major");
// { role: "Secondary Dominant V/ii", isDiatonic: false, alternatives: ["Am"] }
```

---


### 5. Pitch Classification & Scale Degrees

```typescript
import { classifyPitch, getScalePitchClasses, getRomanNumeral } from "@mrjoshida/music-theory";

// Get scale pitch classes without octaves
getScalePitchClasses("A", "Harmonic Minor");
// ["A", "B", "C", "D", "E", "F", "G#"]

// Classify pitch (MIDI or note string) relative to degree ii (1) in C Major
classifyPitch(40, "C", "Major", 1); // 40 = E2
// { chordRole: null, susRole: "sus2", inScale: true }

classifyPitch(41, "C", "Major", 1); // 41 = F2
// { chordRole: "third", susRole: null, inScale: true }

// Modal Roman numeral
getRomanNumeral("C", "Mixolydian", 6); // "bVII"
getRomanNumeral("C", "Harmonic Minor", 6, true); // "vii°7"
```

### 6. Tunings & MIDI Translation

```typescript
import {
  TUNING_PRESETS,
  validateTuning,
  midiToPitchInKey,
  getSuspendedChord
} from "@mrjoshida/music-theory";

// Key-aware MIDI conversion
midiToPitchInKey(70, "F", "Major"); // "Bb4"
midiToPitchInKey(66, "G", "Major"); // "F#4"
midiToPitchInKey(61, "F", "Major"); // "Db4"

// Suspended chords
getSuspendedChord("E", "sus2"); // { name: "Esus2", notes: ["E", "F#", "B"] }

// Validate custom tuning
validateTuning([40, 45, 50, 55, 59, 64]); // { ok: true }
validateTuning([114]); // { ok: false, errors: [...] }
```

## Development

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Build ESM, CJS, and DTS bundles
npm run build
```

## License

MIT
