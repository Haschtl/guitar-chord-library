import { Chord } from "svguitar";
import chords from "../public/database/completeChordsFormatted.json";

export const allChords: Record<string, Chord[]> = chords as Record<
  string,
  Chord[]
>;
export const allChordNames = Object.keys(allChords);

export const translateChordname = (chord: string) => {
  return chord.replace("B", "H").replace("Hb", "B");
};
