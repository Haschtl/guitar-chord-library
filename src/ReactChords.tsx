import { Chord, ChordSettings } from "svguitar";
import "./App.css";
import ReactChord, { ChordExtraSettings } from "./ReactChord";
import { useCallback, useState } from "react";
import { IconButton, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

interface Props {
  chords?: Chord[];
  germanNotation?: boolean;
  defaultIndex?: number;
  settings?: ChordSettings;
  extraSettings?: ChordExtraSettings;
}
const ReactChords: React.FC<Props> = ({
  chords = [],
  defaultIndex = 0,
  germanNotation,
  settings,
  extraSettings,
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
  return (
    <>
      <Typography variant="caption">
        {`${index + 1}/${chords.length}`}
      </Typography>
      <ReactChord
        chord={chords[index]}
        fileAppendix={appendix}
        germanNotation={germanNotation}
        settings={settings}
        extraSettings={extraSettings}
      />
      <IconButton onClick={setPreviousIdx}>
        <ArrowBack />
      </IconButton>
      <IconButton onClick={setNextIdx}>
        <ArrowForward />
      </IconButton>
    </>
  );
};

export default ReactChords;
