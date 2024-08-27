import { Chord, ChordSettings } from "svguitar";
import "./App.css";
import ReactChord, { ChordExtraSettings } from "./ReactChordMui";
import { useCallback, useMemo, useState } from "react";
import {
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

interface Props {
  chords?: Chord[];
  germanNotation?: boolean;
  defaultIndex?: number;
  settings?: ChordSettings;
  extraSettings?: ChordExtraSettings;
  removeTitle?: boolean;
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
const allAppendixes = (chords: Chord[]) => {
  return chords
    .map((_, i) => chordAppendix(chords, i))
    // .filter((v, i, a) => a.indexOf(v) === i);
};
const EMPTY_STR = "-";
const ReactChords: React.FC<Props> = ({
  chords = [],
  defaultIndex = 0,
  germanNotation,
  settings,
  extraSettings,
  removeTitle,
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
    (e: SelectChangeEvent<string>) => {
      setIndex(all.indexOf(e.target.value !== EMPTY_STR ? e.target.value : ""));
    },
    [all]
  );
  if (chords.length <= 0) {
    return (
      <>
        <Typography variant="h4" marginTop="50%">
          {/* {`${index + 1}/${chords.length}`} */}
          n.A.
        </Typography>
      </>
    );
  }
  const appendix = chordAppendix(chords, index);
  return (
    <>
      <Typography variant="caption">
        {`${index + 1}/${chords.length}`}
      </Typography>
      <ReactChord
        removeTitle={removeTitle}
        chord={chords[index]}
        fileAppendix={"-" + appendix + ".svg"}
        germanNotation={germanNotation}
        settings={settings}
        extraSettings={extraSettings}
      />
      <div className="button-bar">
        <IconButton onClick={setPreviousIdx}>
          <ArrowBack />
        </IconButton>
        <Select
          // componentsProps={{ input: { style: { paddingRight: "14px !important" } } }}
          IconComponent={() => null}
          className="variant-select"
          size="small"
          value={appendix !== "" ? appendix : EMPTY_STR}
          onChange={setIndexByAppendix}
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
