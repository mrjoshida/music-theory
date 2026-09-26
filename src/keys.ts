import { Note } from "tonal";
import { ROOT_NOTES, KEY_MODES } from "./constants";

/**
 * Parses a key string (e.g. "C", "C Major", "Am", "A Minor", "F#m", "Eb") into Root and Mode.
 * Mode is returned in Title Case (e.g. "Major", "Minor").
 */
export function parseKey(keyStr?: string): { root: string; mode: string } {
  if (!keyStr || !keyStr.trim()) {
    return { root: "C", mode: "Major" };
  }

  const trimmed = keyStr.trim();

  // Check explicit mode words first
  const modePattern = KEY_MODES.join("|");
  const modeMatch = trimmed.match(new RegExp(`^([A-G][#b]?)\\s*(${modePattern})$`, "i"));
  if (modeMatch) {
    const rawRoot = modeMatch[1].toUpperCase();
    const formattedRoot = rawRoot.length > 1 ? rawRoot[0] + modeMatch[1][1] : rawRoot;
    const rawMode = modeMatch[2].toLowerCase();
    const formattedMode = KEY_MODES.find((m) => m.toLowerCase() === rawMode) || "Major";
    return { root: formattedRoot, mode: formattedMode };
  }

  // Handle shorthand like "Am", "C#m", "Fm"
  const minorShorthandMatch = trimmed.match(/^([A-G][#b]?)m$/i);
  if (minorShorthandMatch) {
    const rawRoot = minorShorthandMatch[1].toUpperCase();
    const formattedRoot = rawRoot.length > 1 ? rawRoot[0] + minorShorthandMatch[1][1] : rawRoot;
    return { root: formattedRoot, mode: "Minor" };
  }

  // Just root note, assume Major
  const rootOnlyMatch = trimmed.match(/^([A-G][#b]?)$/i);
  if (rootOnlyMatch) {
    const rawRoot = rootOnlyMatch[1].toUpperCase();
    const formattedRoot = rawRoot.length > 1 ? rawRoot[0] + rootOnlyMatch[1][1] : rawRoot;
    return { root: formattedRoot, mode: "Major" };
  }

  // Fallback to tonal note parsing
  const parsedNote = Note.get(trimmed);
  if (parsedNote.letter) {
    return { root: parsedNote.pc, mode: "Major" };
  }

  return { root: "C", mode: "Major" };
}

/**
 * Formats root and mode into a clean key string, e.g. "C Major" or "A Minor"
 */
export function formatKey(root: string, mode: string): string {
  const parsedRoot = ROOT_NOTES.find((r) => r.toUpperCase() === root.toUpperCase()) || root;
  const parsedMode = KEY_MODES.find((m) => m.toLowerCase() === mode.toLowerCase()) || "Major";
  return `${parsedRoot} ${parsedMode}`;
}
