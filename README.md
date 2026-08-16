# @mrjoshida/music-theory

A lightweight, robust TypeScript music theory and functional harmony library built on top of [Tonal](https://github.com/tonaljs/tonal). Powers songwriting and audio analysis tools across the FWDBIAS ecosystem (including Wellspring and Song Forge).

## Features

- **Key & Mode Parsing**: Case-tolerant parsing and formatting for musical keys and modes (Major, Minor, Dorian, Phrygian, Lydian, Mixolydian, Locrian).
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
