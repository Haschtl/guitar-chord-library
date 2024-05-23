import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import "./App.css";
import ReactChords from "./ReactChords";
import { Chords, loadChords, translateChordname } from "./chords";
import { useCallback, useEffect, useState } from "react";
import { chordId2name, saveBlob, svgElement2blob } from "./helper";
import { ZipWriter, BlobReader, BlobWriter } from "@zip.js/zip.js";

const fixChordName = (name: string) => {
  return name;
  // return name.replace("#m", "m#");
};
function App() {
  // console.log(allChordNames);
  const [allChords, setAllChords] = useState<Chords>({});
  useEffect(() => {
    loadChords().then((chords) => setAllChords(chords));
  }, []);
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
  const columns = [
    "",
    "7",
    "maj7",
    "6",
    "m",
    "m7",
    "m6",
    "5",
    "7b5",
    "sus2",
    "sus4",
    "dim",
    "9",
    "aug",
    // "maj9",
    // "maj11",
    // "add9",
    // "dim7",
  ];
  const defaultIndices: Record<string, number> = {
    Bm: 1,
    Asus4: 1,
    Bsus4: 3,
    Bm7: 2,
    Cmaj7: 1,
    C6: 1,
    Esus4: 1,
    Esus2: 1,
    F7: 1,
    Fsus4: 1,
    Fsus2: 2,
    Gm: 1,
    Gmaj7: 2,
  };
  const downloadAll = useCallback(() => {
    // const chords=Object.values(allChords).flat()
    const divs = document.querySelectorAll(".svg-wrapper");
    let groupIdx = 0;
    let lastGroup = "";
    const promises = [...divs].map((div) => {
      // (div as HTMLDivElement).click()
      const svg = div.children[0] as SVGSVGElement;
      const blob = svgElement2blob(svg);
      // const filename = chord2filename(chords.find(c=>c.title===div.id),);
      const chordname = chordId2name(div.classList[1]);
      const group = chordname.includes("#")
        ? chordname.slice(0, 2)
        : chordname[0];
      if (group === lastGroup) {
        groupIdx += 1;
      } else {
        lastGroup = group;
        groupIdx = 0;
      }
      const filename = group + "/" + groupIdx+"-"+chordname + ".svg";
      return blob.text().then((content) => ({ filename, content, blob }));
    });
    const zipFileWriter = new BlobWriter();
    const zipWriter = new ZipWriter(zipFileWriter);
    Promise.all(promises)
      .then(async (files) => {
        for (const { filename, blob } of files) {
          // return await Promise.all(
          // files.map(async ({ filename, blob }) => {
          // await zipWriter.add(filename, new TextReader(content));
          // console.log(`Zipping ${filename}`)
          await zipWriter.add(filename, new BlobReader(blob));
        }
        await zipWriter.close();
        // )
        // );
      })
      .then(() => {
        zipFileWriter.getData().then((zipFileBlob) => {
          return saveBlob(zipFileBlob, "chords.zip");
        });
        // console.log("TOO EARLY")
      });
  }, []);
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
                      defaultIndex={defaultIndices[chordName]}
                      germanNotation={germanNotation}
                    />
                  </Paper>
                </Grid>
              );
            })}
          </>
        ))}
      </Grid>
      <Button onClick={downloadAll}>Download all selected</Button>
    </Box>
  );
}

export default App;
