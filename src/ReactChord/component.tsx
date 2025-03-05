import React, { useMemo } from "react";
import type { ChordSettings } from "svguitar";

import { chordName2id } from "../helper";
import { useSVGuitarChord } from "./hooks";
import type { ChordExtraSettings, ChordPlus } from "./types";

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  chord: ChordPlus;
  extraSettings?: ChordExtraSettings;
  fileAppendix?: string;
  germanNotation?: boolean;
  ref?: React.RefObject<HTMLDivElement | null>;
  removeTitle?: boolean;
  settings?: Partial<ChordSettings>;
}
export const ReactChord: React.FC<Props> = ({
  chord,
  germanNotation,
  removeTitle,
  settings,
  //   ref,
  extraSettings,
  fileAppendix,
  id,
  ...props
}) => {
  const id2 = useMemo(
    () => chordName2id(String(chord.title ?? "chart")) + (id ?? ""),
    [chord.title, id]
  );

  useSVGuitarChord(id2, chord, {
    extraSettings,
    germanNotation,
    removeTitle,
    settings,
  });
  return (
    <div
      id={id2}
      //   ref={ref}
      style={{ cursor: "pointer" }}
      // onClick={handleOpen}
      {...props}
      className={`svg-wrapper ${id2}${fileAppendix ?? ""}` + props.className}
    />
  );
};
