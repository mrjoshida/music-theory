export interface DiatonicChord {
  chord: string;
  roman: string;
  isSeventh: boolean;
}

export interface ProgressionAnalysis {
  suggestedScaleName: string | null;
  scaleNotes: string[];
  scaleTonic: string | null;
  allChordNotes: string[];
}

export interface RelatedKey {
  relationship: string;
  key: string;
  mode: string;
}

export interface CircleNeighbor {
  key: string;
  mode: string;
  relationship: string;
}

export interface ChordRelationshipResult {
  role: string;
  isDiatonic: boolean;
  alternatives: string[];
}

export interface ChordQuality {
  label: string;
  suffix: string;
}

export type ChordRole = "root" | "third" | "fifth" | "seventh" | null;
export type SusRole = "sus2" | "sus4" | null;

export interface PitchClassification {
  chordRole: ChordRole;
  susRole: SusRole;
  inScale: boolean;
}

export interface SuspendedChord {
  name: string;
  notes: string[];
}

export interface TuningPreset {
  id: string;
  name: string;
  instrument: string;
  notes: number[];
}

export interface ValidateTuningOptions {
  maxFret?: number;
}

export type ValidateTuningResult =
  | { ok: true }
  | { ok: false; errors: string[] };
