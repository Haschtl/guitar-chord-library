import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Grid,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import "./App.css";
import ReactChords from "./ReactChords";
import { Chords, loadChords, translateChordname } from "./chords";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { chordId2name, saveBlob, svgElement2blob } from "./helper";
import { ZipWriter, BlobReader, BlobWriter } from "@zip.js/zip.js";
import {
  ChordSettings,
  ChordStyle,
  FretLabelPosition,
  Orientation,
} from "svguitar";
import { ChordExtraSettings } from "./ReactChord";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { MuiColorInput } from "mui-color-input";

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

  const [settings, setSettings] = useState<Partial<ChordSettings>>({
    style: ChordStyle.normal,
    orientation: Orientation.vertical,
    fretLabelPosition: FretLabelPosition.RIGHT,
    frets: 5,
    fretLabelFontSize: 38,
    tuningsFontSize: 20,
    fingerSize: 0.65,
    fingerColor: "#000",
    fingerTextColor: "#FFF",
    fingerTextSize: 22,
    fingerStrokeColor: "#000000",
    fingerStrokeWidth: 0,
    barreChordStrokeColor: "#000000",
    barreChordStrokeWidth: 0,
    fretSize: 1,
    sidePadding: 0.2,
    fontFamily: "Arial",
    titleFontSize: 48,
    titleBottomMargin: 0,
    barreChordRadius: 0.5,
    emptyStringIndicatorSize: 0.6,
    strokeWidth: 2,
    nutWidth: 10,
    color: "#000000",
    // titleColor: "",
    noPosition: false,
    fixedDiagramPosition: false,
    watermarkFontSize: 12,
    watermarkColor: "#000000",
    watermarkFontFamily: "Arial",
  });
  const setSettingsAtKey = useCallback(
    (key: keyof ChordSettings, value: string | number | boolean | string[]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );
  const [extraSettings, setExtraSettings] = useState<ChordExtraSettings>({
    showFingerings: true,
    showNoteNames: true,
  });
  const [germanNotation, setGermanNotation] = useState(false);
  const [showTitle, setShowTitle] = useState(false);

  const toggleGermanNotation = useCallback(() => {
    setGermanNotation((prev) => !prev);
  }, []);
  const toggleShowTitle = useCallback(() => {
    setShowTitle((prev) => !prev);
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
  const [notes, setNotes] = useState([
    "A",
    // "A#",
    "B",
    "C",
    // "C#",
    "D",
    // "D#",
    "E",
    "F",
    // "F#",
    "G",
    // "G#",
  ]);
  const [variants, setVariants] = useState([
    "",
    "7",
    "maj7",
    "6",
    "m",
    "m7",
    "m6",
    "5",
    // "7b5",
    // "sus2",
    // "sus4",
    // "dim",
    // "9",
    // "aug",
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
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={1} gap={2}>
        <Card>
          <CardHeader title={"Chord-Selection"} />
          <CardContent>
            <FormGroup>
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
            </FormGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title={"Display"} />
          <CardContent>
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
              <FormControlLabel
                control={
                  <Checkbox checked={showTitle} onClick={toggleShowTitle} />
                }
                label="Show title"
              />
            </FormGroup>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title={"Appearance"} />
          <CardContent>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
              >
                Expand
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  component="form"
                  sx={{
                    "& .MuiTextField-root": { m: 1, width: "25ch" },
                  }}
                  noValidate
                  autoComplete="off"
                >
                  {Object.keys(settings).map((key) => (
                    <Setting
                      key={key}
                      Key={key as keyof ChordSettings}
                      value={settings[key as keyof ChordSettings]}
                      onChange={setSettingsAtKey}
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>
      <br />
      <Grid container spacing={1} columns={variants.length}>
        {notes.map((note) => (
          <>
            {variants.map((ext) => {
              const chordName = fixChordName(note + ext);

              return (
                <Grid key={chordName} item xs={1}>
                  <Paper
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
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
                      removeTitle={!showTitle}
                      settings={settings}
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

const Setting: React.FC<{
  Key: keyof ChordSettings;
  value?: string | number | boolean | string[];
  onChange: (
    key: keyof ChordSettings,
    value: string | number | boolean | string[]
  ) => void;
}> = ({ Key, onChange, value }) => {
  const _onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (typeof value === "number") {
        onChange(Key, Number(e.target.value));
      } else if (typeof value === "boolean") {
        onChange(Key, Boolean(e.target.value));
      } else {
        onChange(Key, e.target.value);
      }
    },
    [onChange, Key, value]
  );
  const _onChange2 = useCallback(
    (e: SelectChangeEvent<string>) => {
      onChange(Key, e.target.value);
    },
    [onChange, Key, value]
  );
  const handleColorChange = useCallback(
    (v: string) => {
      onChange(Key, v);
    },
    [Key, onChange]
  );
  const toggleValue = useCallback(() => {
    onChange(Key, !value);
  }, [Key, onChange, value]);
  if (Key === "style") {
    return (
      <Select value={value as string} onChange={_onChange2}>
        <MenuItem value={ChordStyle.normal}>Normal</MenuItem>
        <MenuItem value={ChordStyle.handdrawn}>Handdrawn</MenuItem>
      </Select>
    );
  } else if (Key === "orientation") {
    return (
      <Select value={value as string} onChange={_onChange2}>
        <MenuItem value={Orientation.vertical}>Vertical</MenuItem>
        <MenuItem value={Orientation.horizontal}>Horizontal</MenuItem>
      </Select>
    );
  } else if (Key === "fretLabelPosition") {
    return (
      <Select value={value as string} onChange={_onChange2}>
        <MenuItem value={FretLabelPosition.RIGHT}>Right</MenuItem>
        <MenuItem value={FretLabelPosition.LEFT}>Left</MenuItem>
      </Select>
    );
  } else if (typeof value === "boolean") {
    return (
      <FormControlLabel
        control={<Checkbox checked={value} onClick={toggleValue} />}
        label={Key}
      />
    );
  } else if (typeof value === "string" && value.startsWith("#")) {
    return (
      <MuiColorInput format="hex" label={Key} value={value} onChange={handleColorChange} />
    );
  }
  return (
    <TextField
      onChange={_onChange}
      value={value}
      label={Key}
      type={
        typeof value === "number"
          ? "number"
          : typeof value === "boolean"
          ? "checkbox"
          : "text"
      }
    />
  );
};
