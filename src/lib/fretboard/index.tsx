import {
  Fretboard,
  type Position,
  type Systems,
} from "@moonwave99/fretboard.js";
import React, { memo, useEffect, useMemo, useState } from "react";
type NoteA = "A" | "B" | "C" | "D" | "E" | "F" | "G";

type Note = NoteA | "A#" | "C#" | "D#" | "F#" | "G#";

const notes: Note[] = [
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
];
const notesA: NoteA[] = ["A", "B", "C", "D", "E", "F", "G"];
interface FretboardOptions {
  dotFill?: string | ((dot: Dot) => void);
  dotText?: (dot: Dot) => void;
  fretColor?: string;
  fretCount?: number;
  fretWidth?: string;
  middleFretColor?: string;

  middleFretWidth?: string;

  noteColors?: Record<Note, string>;

  nutColor?: string;

  nutWidth?: number;

  scaleFrets?: boolean;
  stringCount?: number;
  tuning?: string[];
}

export const b2hash = (note: string) => {
  const n = note.replace("b", "");
  if (note === n) {
    return note;
  }
  const i = notesA.indexOf(n.toUpperCase() as "A");
  if (i < 0) {
    return note;
  } else {
    return notesA[(i - 1) % notesA.length] + "#";
  }
};

export const normal2germanNotation = (chord: string) =>
  chord.replace(/B/g, "H").replace(/Hb/g, "B");

export const german2normalNotation = (chord: string) =>
  chord.replace(/H/g, "B").replace(/B/, "Bb");

export const defaultFretboardOptions = {
  fretColor: "#666",
  fretCount: 15,
  fretWidth: "1",
  middleFretColor: "#ff636c",
  middleFretWidth: "3",
  noteColors: {
    A: "#C550F2",
    "A#": "#4560A255",
    B: "#5590F2",
    C: "#D58052",
    "C#": "#F5C08255",
    D: "#BBBBBB",
    "D#": "#DDDDDD55",
    E: "#FF5052",
    F: "pink",
    "F#": "#D550B255",
    G: "#75F052",
    "G#": "#85F0B255",
  },
  nutColor: "#666",
  nutWidth: 7,
  scaleFrets: true,
  tuning: ["E4", "B3", "G3", "D3", "A2", "E2"],
} satisfies FretboardOptions;

const notePlus = (note: string, plus: number) => {
  const idx = notes.findIndex((v) => v === note);
  if (idx >= 0) {
    return notes[(idx + plus) % notes.length];
  }
};
export interface Dot {
  fret: number;
  string: number;
}
export type ScaleType = "major" | "minor" | "pentatonic minor";
export interface Scale {
  box?: {
    box: Note;
    system: Systems;
  };
  root: Note;
  type: ScaleType;
}
interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  > {
  dots?: Position[];
  id?: string;
  options?: FretboardOptions;
  scale?: Scale;
}
const FretboardComponent: React.FC<Props> = ({
  options: __options,
  // fretCount: 15,
  // tuning,
  dots,
  scale,
  id = "fretboard",
  ...props
}) => {
  // useEffect(() => {
  //   if (token) {
  //     search(token, { q: "track:Wäsche" })
  //       .then(console.log)
  //       .catch(console.error);
  //   }
  // }, [token]);
  const options = useMemo(() => {
    const _options = { ...defaultFretboardOptions, ...__options };
    const tt = _options?.tuning;
    const simpleTuning = tt.map((t) => t.replace(/[0-9]/g, ""));
    const noteColors = _options?.noteColors;
    const noteColor = (note?: string) => noteColors[note as "A"] ?? "red";

    const stringCount = simpleTuning.length;
    return {
      dotFill: (dot: Dot) =>
        noteColor(notePlus(simpleTuning[dot.string - 1], dot.fret)),
      dotText: (dot: Dot) =>
        normal2germanNotation(
          notePlus(simpleTuning[dot.string - 1], dot.fret) ?? ""
        ),
      el: "#" + id,
      stringCount,
      ..._options,
      tuning: tt,
    };
  }, [__options, id]);

  const [fretboard, setFretboard] = useState<Fretboard>();

  useEffect(() => {
    // let f:typeof Fretboard.prototype
    if (fretboard) {
      fretboard.clear();
    }
    const f = new Fretboard(options);
    setFretboard(f);

    return () => {
      f.clear();
      if ("svg" in f) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        f.svg.remove();
      }
      setFretboard(undefined);
    };
  }, [options]);
  // const lastDots=useRef(JSON.stringify(dots))
  useEffect(() => {
    // const n = JSON.stringify(dots);
    if (fretboard && dots) {
      try {
        // lastDots.current = n;
        fretboard.setDots(dots);
        fretboard.render();
      } catch (e) {
        console.error(e);
      }
    }
  }, [fretboard, dots]);
  // const lastScale = useRef(JSON.stringify(dots));

  useEffect(() => {
    // const n = JSON.stringify(scale);
    if (
      fretboard &&
      scale
      //  && n !== lastScale.current
    ) {
      try {
        // lastScale.current = n;
        fretboard.renderScale(scale);
        // fretboard.render();
      } catch (e) {
        console.error(e);
      }
    }
  }, [fretboard, scale]);
  return (
    <div className="fretboard-component">
      <figure id={id} {...props} />
      {/* <div style={{ height: "18px" }} /> */}
    </div>
  );
};

export const fillFretboard = (frets: number, strings: number): Position[] =>
  new Array(strings)
    .fill(0)
    .map((_, strIdx) =>
      new Array(frets + 1)
        .fill(0)
        .map((__, fretIdx) => ({ fret: fretIdx, string: strIdx + 1 }))
    )
    .flat();
const FretboardComponentMemo = memo(FretboardComponent);
export default FretboardComponentMemo;
