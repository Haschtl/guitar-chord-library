import type { Chord } from "svguitar";
// import chords from "../public/database/completeChordsFormatted.json";

export type Chords = Record<string, Chord[] | undefined>;

// export const allChords: Chords = chords as any;
// export const allChordNames = Object.keys(allChords);

export const normal2germanNotation = (chord: string) =>
  chord.replace(/B/g, "H").replace(/Hb/g, "B");

export const german2normalNotation = (chord: string) =>
  chord.replace(/H/g, "B").replace(/B/, "Bb");

export const loadChords = async () =>
  await fetch(
    import.meta.env.BASE_URL + `database/completeChordsFormatted.json`
  ).then(async (response) => await (response.json() as Promise<Chords>));

export function chord2filename(
  chord: Chord,
  fileAppendix = ".svg",
  germanNotation = false
) {
  return chord.title
    ? (germanNotation ? normal2germanNotation(chord.title) : chord.title) +
        fileAppendix
    : "chord" + fileAppendix;
}
