import { ArrowBack, ArrowForward } from "@mui/icons-material";
import {
  type ButtonProps,
  IconButton,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Typography,
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import type { Chord, ChordSettings } from "svguitar";

import type { ChordExtraSettings } from "./ReactChord";
import ReactChordEditable from "./ReactChordEditable";

interface Props extends ButtonProps {
  chords?: Chord[];
  defaultIndex?: number;
  extraSettings: ChordExtraSettings;
  fallback?: React.ReactNode;
  germanNotation: boolean;
  removeTitle: boolean;
  settings: ChordSettings;
}
const chordAppendix = (chords: Chord[], index: number) => {
  const position = chords[index].position ?? 1;
  const positions = chords.map((c) => c.position ?? 1);
  const numIdenticalPositions = positions.filter((p) => p === position).length;
  const positionIndex = positions.slice(0, index + 1).reduce((p, c) => {
    if (c === position) {
      p += 1;
    }
    return p;
  }, 0);
  let appendix = "";
  if (position > 1) {
    appendix += "-" + position + "fr";
  }
  if (numIdenticalPositions > 1) {
    appendix += "-v" + positionIndex;
  }
  return appendix.slice(1);
};
const allAppendixes = (chords: Chord[]) =>
  chords.map((_, i) => chordAppendix(chords, i));
// .filter((v, i, a) => a.indexOf(v) === i);
const nullF = () => null;
const EMPTY_STR = "-";

const ReactChords: React.FC<Props> = ({
  chords = [],
  defaultIndex = 0,
  germanNotation,
  settings,
  extraSettings,
  removeTitle,
  fallback,
  ...props
}) => {
  const [index, setIndex] = useState(defaultIndex);
  const setSmartIndex = useCallback(
    (step: number) => {
      setIndex((chords.length + index + step) % chords.length);
    },
    [chords.length, index]
  );
  const setPreviousIdx = useCallback(() => {
    setSmartIndex(-1);
  }, [setSmartIndex]);
  const setNextIdx = useCallback(() => {
    setSmartIndex(1);
  }, [setSmartIndex]);
  const all = useMemo(() => allAppendixes(chords), [chords]);
  const setIndexByAppendix = useCallback(
    (e: SelectChangeEvent) => {
      setIndex(all.indexOf(e.target.value !== EMPTY_STR ? e.target.value : ""));
    },
    [all]
  );
  if (chords.length <= 0) {
    return (
      <Typography marginTop="50%" variant="h4">
        {/* {`${index + 1}/${chords.length}`} */}
        {fallback ?? "n.A."}
      </Typography>
    );
  }
  const appendix = chordAppendix(chords, index);
  return (
    <>
      <Typography variant="caption">
        {`${index + 1}/${chords.length}`}
      </Typography>
      <ReactChordEditable
        chord={chords[index]}
        extraSettings={extraSettings}
        fileAppendix={"-" + appendix + ".svg"}
        germanNotation={germanNotation}
        removeTitle={removeTitle}
        settings={settings}
        {...props}
      />
      <div className="button-bar">
        <IconButton onClick={setPreviousIdx}>
          <ArrowBack />
        </IconButton>
        <Select
          // componentsProps={{ input: { style: { paddingRight: "14px !important" } } }}
          IconComponent={nullF}
          className="variant-select"
          onChange={setIndexByAppendix}
          size="small"
          value={appendix !== "" ? appendix : EMPTY_STR}
        >
          {all
            .toSorted((a, b) => a.localeCompare(b))
            .map((v) => (
              <MenuItem key={v} value={v !== "" ? v : EMPTY_STR}>
                {v !== "" ? v : EMPTY_STR}
              </MenuItem>
            ))}
        </Select>
        <IconButton onClick={setNextIdx}>
          <ArrowForward />
        </IconButton>
      </div>
    </>
  );
};

export default ReactChords;
