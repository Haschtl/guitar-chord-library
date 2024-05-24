import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import "./App.css";
import ReactChords from "./ReactChords";
import { Chords, loadChords, translateChordname } from "./chords";
import { useCallback, useEffect, useState } from "react";
import { chordId2name, saveBlob, svgElement2blob } from "./helper";
import { ZipWriter, BlobReader, BlobWriter } from "@zip.js/zip.js";
// import { ChordSettings } from "svguitar";
import { ChordExtraSettings } from "./ReactChord";

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

  // const [settings, setSettings] = useState<Partial<ChordSettings>>({});
  const [extraSettings, setExtraSettings] = useState<ChordExtraSettings>({
    showFingerings: true,
    showNoteNames: true,
  });
  const [germanNotation, setGermanNotation] = useState(false);

  const toggleGermanNotation = useCallback(() => {
    setGermanNotation((prev) => !prev);
  }, []);

  const toggleShowNoteNames = useCallback(() => {
    setExtraSettings((prev) => ({
      ...prev,
      showNoteNames: !prev.showNoteNames,
    }));
  }, []);

  const toggleShowNoteFingerings = useCallback(() => {
    setExtraSettings((prev) => ({
      ...prev,
      showFingerings: !prev.showFingerings,
    }));
  }, []);

  const allNotes = [
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
  const allVariants =
    Object.keys(allChords)
      ?.filter((c) => c.startsWith(allNotes[1]))
      .map((c) => c.replace(allNotes[1], "")) ?? [];
  const [notes, setNotes] = useState(allNotes);
  const [variants, setVariants] = useState([
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
  ]);

  const notesChanged = useCallback((e: SelectChangeEvent<string[]>) => {
    setNotes(e.target.value as string[]);
  }, []);
  const variantsChanged = useCallback((e: SelectChangeEvent<string[]>) => {
    setVariants(e.target.value as string[]);
  }, []);
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
      const filename = group + "/" + groupIdx + "-" + chordname + ".svg";
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
      <Grid container spacing={1} columns={variants.length}>
        <Select multiple value={notes} onChange={notesChanged}>
          {allNotes.map((n) => (
            <MenuItem value={n} key={n}>
              {n}
            </MenuItem>
          ))}
        </Select>
        <Select multiple value={variants} onChange={variantsChanged}>
          {allVariants.map((n) => (
            <MenuItem value={n} key={n}>
              {n === "" ? "Dur" : n}
            </MenuItem>
          ))}
        </Select>

        <FormGroup>
          <FormControlLabel
            control={
              <Checkbox
                checked={extraSettings.showFingerings}
                onClick={toggleShowNoteFingerings}
              />
            }
            label="Show fingering"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={extraSettings.showNoteNames}
                onClick={toggleShowNoteNames}
              />
            }
            label="Show notes"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={germanNotation}
                onClick={toggleGermanNotation}
              />
            }
            label="German notation (B->H)"
          />
        </FormGroup>
      </Grid>
      <Grid container spacing={1} columns={variants.length}>
        {notes.map((note) => (
          <>
            {variants.map((ext) => {
              const chordName = fixChordName(note + ext);

              return (
                <Grid key={chordName} item xs={1}>
                  <Paper sx={{ height: "100%" }}>
                    <Typography variant="subtitle2">
                      {germanNotation
                        ? translateChordname(chordName)
                        : chordName}
                    </Typography>
                    <ReactChords
                      chords={allChords[chordName]}
                      defaultIndex={defaultIndices[chordName]}
                      germanNotation={germanNotation}
                      extraSettings={extraSettings}
                      // settings={settings}
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
