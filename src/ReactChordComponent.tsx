import { useCallback, useEffect, useMemo, useState } from "react";
import { ChordExtraSettings, ChordPlus, configureChord, useSVGuitarChord } from "./ReactChord";
import { ChordSettings } from "svguitar";
import { chordName2id } from "./helper";

interface Props
  extends Partial<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >
  > {
  chord: ChordPlus | string;
  settings?: Partial<ChordSettings>;
  extraSettings?: ChordExtraSettings;
  germanNotation?: boolean;
  removeTitle?: boolean;
  fileAppendix?: string;
}
const jsonRead = (v?: string) => {
  if (v)
    try {
      return JSON.parse(v);
    } catch {
      console.error("ups");
    }
};
const p = (chord: ChordPlus | string) =>
  typeof chord === "string" ? jsonRead(chord) : chord;

const ReactChordComponent: React.FC<Props> = ({
  id: idPlus,
  chord,
  settings,
  extraSettings,
  germanNotation,
  removeTitle,
  fileAppendix,
  ...props
}) => {
  const id = useMemo(
    () => idPlus??chordName2id(String(p(chord).title) ?? "chart"),
    [chord, idPlus]
  );
  const [chordState, _setChordState] = useState<ChordPlus>(p(chord));

  const setChordState = useCallback((chord: ChordPlus) => {
    try {
      //   const chordStr = JSON.stringify(chord, null, 4);
      //   _setChordStateStr(chordStr);
      _setChordState(chord);
      //   setEdited(false);
      // if (resetEditor) {
      //   editorRef.current?.getModel()?.setValue(chordStr);
      // }
    } catch {
      console.error("JSON malformed");
    }
  }, []);
  //   const setChordStateByString = useCallback((v: string) => {
  //     const x = jsonRead(v);
  //     if (x) {
  //       _setChordState(x);
  //     }
  //   }, []);
  const reset = useCallback(() => {
    setChordState(
      configureChord(p(chord), {
        settings,
        extraSettings,
        germanNotation,
        removeTitle,
      })
    );
  }, [
    chord,
    setChordState,
    extraSettings,
    germanNotation,
    removeTitle,
    settings,
  ]);
  useEffect(() => {
    reset();
  }, [reset]);

  useSVGuitarChord(id, chordState, {
    settings,
    extraSettings,
    germanNotation,
    removeTitle,
  });
  return (
    <div
      id={`${id}`}
      className={`svg-wrapper ${id}${fileAppendix}`}
      style={{ cursor: "pointer" }}
      {...props}
      // ref={ref}
    ></div>
  );
};

export default ReactChordComponent;
