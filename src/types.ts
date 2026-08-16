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
