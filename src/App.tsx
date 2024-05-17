import { Box, Grid, Paper, Typography } from "@mui/material";
import "./App.css";
import ReactChords from "./ReactChords";
import { Chords, loadChords, translateChordname } from "./chords";
import { useEffect, useState } from "react";

const fixChordName=(name:string)=>{
  return name;
  // return name.replace("#m", "m#");
}
function App() {
  // console.log(allChordNames);
  const [allChords,setAllChords]=useState<Chords>({})
  useEffect(()=>{
    loadChords().then(chords=>setAllChords(chords))
  },[])
  // const chord: Chord = {
  //   // array of [string, fret, text | options]
  //   fingers: [
  //     // finger at string 1, fret 2, with text '2'
  //     [1, 2, "2"],

  //     // finger at string 2, fret 3, with text '3', colored red and has class '.red'
  //     [2, 3, { text: "3", color: "#F00", className: "red" }],

  //     // finger is triangle shaped
  //     [3, 3, { shape: Shape.TRIANGLE }],
  //     [6, "x"],
  //   ],

  //   // optional: barres for barre chords
  //   barres: [
  //     {
  //       fromString: 5,
  //       toString: 1,
  //       fret: 1,
  //       text: "1",
  //       color: "#0F0",
  //       textColor: "#F00",
  //       className: "my-barre-chord",
  //     },
  //   ],

  //   // title of the chart (optional)
  //   title: "F# minor",

  //   // position (defaults to 1)
  //   position: 2,
  // };
  const [germanNotation] = useState(true);
  const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  const columns = [
    "",
    "m",
    "7",
    "m7",
    "sus2",
    "sus4",
    "dim",
    "6",
    "m6",
    "maj7",
    "9",
    "maj9",
    "maj11",
    "add9",
    "dim7",
    "7b5",
    "aug",
    "5",
  ];
  return (
    <Box sx={{ flexGrow: 1, minWidth: "2000px" }}>
      <Grid container spacing={1} columns={columns.length}>
        {notes.map((note) => (
          <>
            {columns.map((ext) => {
              const chordName = fixChordName(note + ext);
              
              return (
                <Grid key={chordName} item xs={1}>
                  <Paper>
                    <Typography variant="subtitle2">
                      {germanNotation
                        ? translateChordname(chordName)
                        : chordName}
                    </Typography>
                    <ReactChords
                      chords={allChords[chordName]}
                      germanNotation={germanNotation}
                    />
                  </Paper>
                </Grid>
              );
            })}
          </>
        ))}
      </Grid>
    </Box>
  );
}

export default App;
