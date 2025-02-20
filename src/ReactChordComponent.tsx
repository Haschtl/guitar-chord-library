// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import type { ChordSettings } from "svguitar";

// import { chordName2id } from "./helper";
// import {
//   type ChordExtraSettings,
//   type ChordPlus,
//   configureChord,
//   useSVGuitarChord,
// } from "./ReactChord";

// interface Props
//   extends Partial<
//     React.DetailedHTMLProps<
//       React.HTMLAttributes<HTMLDivElement>,
//       HTMLDivElement
//     >
//   > {
//   chord: ChordPlus | string;
//   extraSettings?: ChordExtraSettings;
//   fileAppendix?: string;
//   germanNotation?: boolean;
//   removeTitle?: boolean;
//   settings?: Partial<ChordSettings>;
// }
// // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
// function jsonRead<T extends Record<string, unknown>>(v?: string): T | null {
//   if (v)
//     try {
//       return JSON.parse(v) as T;
//     } catch {
//       console.error("ups");
//       return null;
//     }
//   return null;
// }
// function p(chord: ChordPlus | string) {
//   return typeof chord === "string" ? jsonRead<ChordPlus>(chord) : chord;
// }

// const ReactChordComponent: React.FC<Props> = ({
//   id: idPlus,
//   chord,
//   settings,
//   extraSettings,
//   germanNotation,
//   removeTitle,
//   fileAppendix,
//   ...props
// }) => {
//   const id = useMemo(
//     () => idPlus ?? chordName2id(String(p(chord)?.title ?? "chart")),
//     [chord, idPlus]
//   );
//   const [chordState, setChordState] = useState<ChordPlus | null>(p(chord));

//   const safeSetChordState = useCallback((chord: ChordPlus) => {
//     try {
//       //   const chordStr = JSON.stringify(chord, null, 4);
//       //   _setChordStateStr(chordStr);
//       setChordState(chord);
//       //   setEdited(false);
//       // if (resetEditor) {
//       //   editorRef.current?.getModel()?.setValue(chordStr);
//       // }
//     } catch {
//       console.error("JSON malformed");
//     }
//   }, []);
//   //   const setChordStateByString = useCallback((v: string) => {
//   //     const x = jsonRead(v);
//   //     if (x) {
//   //       setChordState(x);
//   //     }
//   //   }, []);
//   const reset = useCallback(() => {
//     const c = p(chord);
//     if (c)
//       safeSetChordState(
//         configureChord(c, {
//           extraSettings,
//           germanNotation,
//           removeTitle,
//           settings,
//         })
//       );
//   }, [
//     chord,
//     safeSetChordState,
//     extraSettings,
//     germanNotation,
//     removeTitle,
//     settings,
//   ]);
//   useEffect(() => {
//     reset();
//   }, [reset]);

//   useSVGuitarChord(id, chordState ?? { barres: [], fingers: [] }, {
//     extraSettings,
//     germanNotation,
//     removeTitle,
//     settings,
//   });
//   return (
//     <div
//       className={`svg-wrapper ${id}${fileAppendix}`}
//       id={id}
//       style={{ cursor: "pointer" }}
//       {...props}
//       // ref={ref}
//     />
//   );
// };

// export default ReactChordComponent;
