import { Chord } from "svguitar";
// import chords from "../public/database/completeChordsFormatted.json";

export type Chords = Record<string, Chord[]>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// export const allChords: Chords = chords as any;
// export const allChordNames = Object.keys(allChords);

export const translateChordname = (chord: string) => {
  return chord.replace("B", "H").replace("Hb", "B");
};

export const loadChords = ()=>fetch(import.meta.env.BASE_URL+`database/completeChordsFormatted.json`)
  .then((response) => response.json() as Promise<Chords>)