import { Chord } from "svguitar";
import chords from "../public/database/completeChordsFormatted.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const allChords: Record<string, Chord[]> = chords as any;
export const allChordNames = Object.keys(allChords);

export const translateChordname = (chord: string) => {
  return chord.replace("B", "H").replace("Hb", "B");
};
