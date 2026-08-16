import { Chord, Scale, Note } from "tonal";
import type {
  ProgressionAnalysis,
  RelatedKey,
  CircleNeighbor,
  ChordRelationshipResult
} from "./types";
import { getDiatonicChordNames } from "./diatonic";

/**
 * Analyzes an array of chord names to detect the overarching parent scale.
 * Extracts unique pitch classes from all chords and searches for a matching scale.
 */
export function analyzeProgression(chords: string[]): ProgressionAnalysis {
  const uniqueNotes = new Set<string>();

  // 1. Extract all notes
  chords.forEach((c) => {
    const chordData = Chord.get(c);
    if (!chordData.empty) {
      chordData.notes.forEach((n) => {
        const pc = Note.pitchClass(n); // e.g. "C#", no octave
        if (pc) uniqueNotes.add(pc);
      });
    }
  });

  const notesArray = Array.from(uniqueNotes);

  // 2. Detect scales
  const detected = Scale.detect(notesArray);

  // Filter to prioritize common diatonic scales (major/minor) if multiple are found
  const majorMinorMatches = detected.filter(
    (s) => s.endsWith("major") || s.endsWith("minor")
  );

  const suggestedName =
    majorMinorMatches.length > 0 ? majorMinorMatches[0] : (detected[0] || null);

  let scaleNotes: string[] = [];
  let scaleTonic: string | null = null;

  if (suggestedName) {
    const scaleData = Scale.get(suggestedName);
    if (!scaleData.empty) {
      scaleNotes = scaleData.notes;
      scaleTonic = scaleData.tonic;
    }
  }

  return {
    suggestedScaleName: suggestedName,
    scaleNotes,
    scaleTonic,
    allChordNotes: notesArray,
  };
}

/**
 * Returns related keys (Parallel, Relative, Dominant, Subdominant, Modal Interchange)
 * Normalizes mode case-insensitively.
 */
export function getRelatedKeys(key: string, mode: string): RelatedKey[] {
  const normalizedMode = mode.toLowerCase();
  const p: RelatedKey[] = [];

  // 1. Parallel
  if (normalizedMode === "major") {
    p.push({ relationship: "Parallel Minor", key, mode: "minor" });
  } else if (normalizedMode === "minor") {
    p.push({ relationship: "Parallel Major", key, mode: "major" });
  }

  // 2. Relative
  if (normalizedMode === "major") {
    const relMinorTonic = Note.transpose(key, "-3m");
    p.push({ relationship: "Relative Minor", key: relMinorTonic, mode: "minor" });
  } else if (normalizedMode === "minor") {
    const relMajorTonic = Note.transpose(key, "3m");
    p.push({ relationship: "Relative Major", key: relMajorTonic, mode: "major" });
  }

  // 3. Dominant / Subdominant
  const dominant = Note.transpose(key, "5P");
  const subdominant = Note.transpose(key, "4P");
  p.push({ relationship: "Dominant", key: dominant, mode: normalizedMode });
  p.push({ relationship: "Subdominant", key: subdominant, mode: normalizedMode });

  // 4. Modal Interchange (same tonic, other modes)
  const otherModes = ["dorian", "phrygian", "lydian", "mixolydian", "locrian"].filter(
    (m) => m !== normalizedMode
  );
  otherModes.forEach((m) => {
    p.push({ relationship: `Modal (${m})`, key, mode: m });
  });

  return p;
}

/**
 * Returns Circle of Fifths neighbors for a given key and mode.
 * Normalizes mode case-insensitively.
 */
export function getCircleNeighbors(key: string, mode: string): CircleNeighbor[] {
  const normalizedMode = mode.toLowerCase();
  const p: CircleNeighbor[] = [];

  if (normalizedMode === "major") {
    const tonic = key;
    const subdominant = Note.transpose(key, "4P");
    const dominant = Note.transpose(key, "5P");

    const relMinor = Note.transpose(key, "-3m");
    const relSubMinor = Note.transpose(subdominant, "-3m");
    const relDomMinor = Note.transpose(dominant, "-3m");

    p.push({ key: subdominant, mode: "major", relationship: "IV" });
    p.push({ key: tonic, mode: "major", relationship: "I" });
    p.push({ key: dominant, mode: "major", relationship: "V" });

    p.push({ key: relSubMinor, mode: "minor", relationship: "ii" });
    p.push({ key: relMinor, mode: "minor", relationship: "vi" });
    p.push({ key: relDomMinor, mode: "minor", relationship: "iii" });
  } else if (normalizedMode === "minor") {
    const tonic = key;
    const subdominant = Note.transpose(key, "4P");
    const dominant = Note.transpose(key, "5P");

    const relMajor = Note.transpose(key, "3m");
    const relSubMajor = Note.transpose(subdominant, "3m");
    const relDomMajor = Note.transpose(dominant, "3m");

    p.push({ key: relSubMajor, mode: "major", relationship: "VI" });
    p.push({ key: relMajor, mode: "major", relationship: "III" });
    p.push({ key: relDomMajor, mode: "major", relationship: "VII" });

    p.push({ key: subdominant, mode: "minor", relationship: "iv" });
    p.push({ key: tonic, mode: "minor", relationship: "i" });
    p.push({ key: dominant, mode: "minor", relationship: "v" });
  }

  return p;
}

function findChordIndex(scaleChords: string[], targetChordName: string): number {
  const targetChord = Chord.get(targetChordName);
  if (targetChord.empty) return -1;
  const targetNotes = targetChord.notes.slice().sort().join(",");

  return scaleChords.findIndex((c) => {
    const dc = Chord.get(c);
    return !dc.empty && dc.notes.slice().sort().join(",") === targetNotes;
  });
}

/**
 * Analyzes relationship of a chord to a key/mode (Diatonic, Borrowed, Secondary Dominant, etc.)
 * Normalizes mode case-insensitively.
 */
export function analyzeChordRelationship(
  chordName: string,
  key: string,
  mode: string
): ChordRelationshipResult {
  const normalizedMode = mode.toLowerCase();
  try {
    const chord = Chord.get(chordName);
    if (chord.empty) return { role: "Unknown", isDiatonic: false, alternatives: [] };

    const scaleChordsTriads = getDiatonicChordNames(key, normalizedMode, false);
    const scaleChords7ths = getDiatonicChordNames(key, normalizedMode, true);

    const labels =
      normalizedMode === "major"
        ? ["Tonic", "Pre-dom", "Tonic Sub", "Pre-dom", "Dom (Tense)", "Tonic Sub", "Dom (Tense)"]
        : ["Tonic", "Pre-dom", "Rel Major", "Pre-dom", "Dominant", "Pre-dom", "Subtonic"];

    // Find if it is diatonic
    let index = findChordIndex(scaleChordsTriads, chordName);
    if (index !== -1) {
      return { role: labels[index] || "Diatonic", isDiatonic: true, alternatives: [] };
    }

    index = findChordIndex(scaleChords7ths, chordName);
    if (index !== -1) {
      return { role: labels[index] || "Diatonic (7th)", isDiatonic: true, alternatives: [] };
    }

    // Not diatonic! Check Modal Interchange (Parallel Modes)
    const parallelModes = [
      "major",
      "minor",
      "dorian",
      "phrygian",
      "lydian",
      "mixolydian",
      "locrian",
    ].filter((m) => m !== normalizedMode);

    for (const m of parallelModes) {
      const pChordsTriads = getDiatonicChordNames(key, m, false);
      const pChords7ths = getDiatonicChordNames(key, m, true);

      let pIndex = findChordIndex(pChordsTriads, chordName);
      if (pIndex !== -1) {
        const diatonicWithSameRoot = scaleChordsTriads.filter(
          (c) => Chord.get(c).tonic === chord.tonic
        );
        return {
          role: `Borrowed from ${m}`,
          isDiatonic: false,
          alternatives:
            diatonicWithSameRoot.length > 0
              ? diatonicWithSameRoot
              : [scaleChordsTriads[pIndex]],
        };
      }

      pIndex = findChordIndex(pChords7ths, chordName);
      if (pIndex !== -1) {
        const diatonicWithSameRoot = scaleChords7ths.filter(
          (c) => Chord.get(c).tonic === chord.tonic
        );
        return {
          role: `Borrowed from ${m} (7th)`,
          isDiatonic: false,
          alternatives:
            diatonicWithSameRoot.length > 0
              ? diatonicWithSameRoot
              : [scaleChords7ths[pIndex]],
        };
      }
    }

    const root = chord.tonic;
    if (!root) return { role: "Unknown", isDiatonic: false, alternatives: [] };
    const quality = chord.type;

    // Check Secondary Leading Tone (vii°/X) for diminished chords
    if (
      quality === "diminished" ||
      quality === "diminished seventh" ||
      quality === "half-diminished" ||
      quality === "m7b5" ||
      chord.quality === "Diminished"
    ) {
      const targetNote = Note.transpose(root, "2m");
      const diatonicRoots = scaleChordsTriads.map((c) => Chord.get(c).tonic);
      const targetIndex = diatonicRoots.indexOf(targetNote);
      if (targetIndex !== -1) {
        const romanNumerals =
          normalizedMode === "major"
            ? ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
            : ["i", "ii°", "III", "iv", "v", "VI", "VII"];
        const targetRN = romanNumerals[targetIndex];
        const diatonicWithSameRoot = scaleChordsTriads.filter((c) => Chord.get(c).tonic === root);
        return {
          role: `Secondary Leading Tone vii°/${targetRN}`,
          isDiatonic: false,
          alternatives:
            diatonicWithSameRoot.length > 0
              ? diatonicWithSameRoot
              : [scaleChordsTriads[targetIndex]],
        };
      }
    }

    // Check Augmented chords
    if (quality === "augmented" || chord.quality === "Augmented") {
      const diatonicWithSameRoot = scaleChordsTriads.filter((c) => Chord.get(c).tonic === root);
      if (diatonicWithSameRoot.length > 0) {
        return {
          role: "Altered Diatonic (Augmented)",
          isDiatonic: false,
          alternatives: diatonicWithSameRoot,
        };
      }
    }

    // Check Secondary Dominant (V of V, etc.)
    const isDominantType =
      quality === "major" ||
      quality === "dominant seventh" ||
      quality === "7" ||
      chord.aliases.includes("7") ||
      (chord.quality === "Major" && chord.intervals.includes("7m"));

    if (isDominantType) {
      const targetNote = Note.transpose(root, "4P");
      const diatonicRoots = scaleChordsTriads.map((c) => Chord.get(c).tonic);
      const targetIndex = diatonicRoots.indexOf(targetNote);
      if (targetIndex !== -1) {
        const romanNumerals =
          normalizedMode === "major"
            ? ["I", "ii", "iii", "IV", "V", "vi", "vii°"]
            : ["i", "ii°", "III", "iv", "v", "VI", "VII"];
        const targetRN = romanNumerals[targetIndex];
        const diatonicWithSameRoot = scaleChordsTriads.filter((c) => Chord.get(c).tonic === root);
        return {
          role: `Secondary Dominant V/${targetRN}`,
          isDiatonic: false,
          alternatives:
            diatonicWithSameRoot.length > 0
              ? diatonicWithSameRoot
              : [scaleChordsTriads[targetIndex]],
        };
      }
    }

    // Fallback
    const diatonicWithSameRoot = scaleChordsTriads.filter((c) => Chord.get(c).tonic === root);
    return {
      role: "Out-of-key",
      isDiatonic: false,
      alternatives:
        diatonicWithSameRoot.length > 0
          ? diatonicWithSameRoot
          : [scaleChordsTriads[0]],
    };
  } catch (e) {
    console.error(`Error analyzing chord ${chordName}:`, e);
    return { role: "Analysis Error", isDiatonic: false, alternatives: [] };
  }
}
