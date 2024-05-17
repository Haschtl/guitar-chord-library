import { Chord } from "svguitar";
import "./App.css";
import ReactChord from "./ReactChord";
import { useCallback, useState } from "react";
import { IconButton, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

interface Props {
  chords?: Chord[];
  germanNotation?: boolean;
}
const ReactChords: React.FC<Props> = ({ chords=[], germanNotation }) => {
  const [index, setIndex] = useState(0);
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
  if (chords.length<=0){
    return (
      <>
        <Typography variant="caption">
          {`${index + 1}/${chords.length}`}
        </Typography>
      </>
    );
  }
  return (
    <>
                <Typography variant="caption">

      {`${index + 1}/${chords.length}`}
</Typography>
      <ReactChord chord={chords[index]} germanNotation={germanNotation} />
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
