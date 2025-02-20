import "./App.css";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";
import { MuiColorInput } from "mui-color-input";
import React, {
  type ChangeEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  type ChordSettings,
  ChordStyle,
  FretLabelPosition,
  type FretMarker,
  Orientation,
} from "svguitar";

import { type Chords, loadChords, normal2germanNotation } from "./chords";
import { useSettings } from "./context";
import { chordId2name, saveBlob, svgElement2blob } from "./helper";
import ReactChords from "./ReactChords";

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

const fixChordName = (name: string) => name;
// return name.replace("#m", "m#");
function App() {
  // console.log(allChordNames);
  const [allChords, setAllChords] = useState<Chords>({});
  useEffect(() => {
    loadChords().then((chords) => {
      setAllChords(chords);
    });
  }, []);
  const {
    settings,
    setDisplaySetting,
    toggleGermanNotation,
    toggleShowNoteFingerings,
    toggleShowNoteNames,
    toggleShowTitle,
  } = useSettings();
  // const [settings, setSettings] = useState<Partial<ChordSettings>>({
  //   barreChordRadius: 0.5,
  //   barreChordStrokeColor: "#000000",
  //   barreChordStrokeWidth: 0,
  //   color: "#000000",
  //   emptyStringIndicatorSize: 0.6,
  //   fingerColor: "#000",
  //   fingerSize: 0.65,
  //   fingerStrokeColor: "#000000",
  //   fingerStrokeWidth: 0,
  //   fingerTextColor: "#FFF",
  //   fingerTextSize: 22,
  //   fixedDiagramPosition: false,
  //   fontFamily: "Arial",
  //   fretLabelFontSize: 38,
  //   fretLabelPosition: FretLabelPosition.RIGHT,
  //   fretSize: 1,
  //   frets: 5,
  //   noPosition: false,
  //   nutWidth: 10,
  //   orientation: Orientation.vertical,
  //   sidePadding: 0.2,
  //   strokeWidth: 2,
  //   style: ChordStyle.normal,
  //   titleBottomMargin: 0,
  //   // titleColor: "",
  //   titleFontSize: 48,
  //   tuningsFontSize: 20,
  //   watermarkColor: "#000000",
  //   watermarkFontFamily: "Arial",
  //   watermarkFontSize: 12,
  // });
  // const [extraSettings, setExtraSettings] = useState<ChordExtraSettings>({
  //   showFingerings: true,
  //   showNoteNames: true,
  // });
  // const [germanNotation, setGermanNotation] = useState(false);
  // const [showTitle, setShowTitle] = useState(false);

  const allVariants =
    Object.keys(allChords)
      .filter((c) => c.startsWith(allNotes[1]))
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
  const variantsChanged = useCallback(
    (_: React.SyntheticEvent, values: string[]) => {
      setVariants(values);
    },
    []
  );
  const defaultIndices: Record<string, number> = {
    Asus4: 1,
    Bm: 1,
    Bm7: 2,
    Bsus4: 3,
    C6: 1,
    Cmaj7: 1,
    Esus2: 1,
    Esus4: 1,
    F7: 1,
    Fsus2: 2,
    Fsus4: 1,
    Gm: 1,
    Gmaj7: 2,
  };
  const downloadAll = useCallback(() => {
    // const chords=Object.values(allChords).flat()
    const divs = document.querySelectorAll(".svg-wrapper");
    let groupIdx = 0;
    let lastGroup = "";
    const promises = [...divs].map(async (div) => {
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
      console.log(svg, filename);
      return await blob.text().then((content) => ({ blob, content, filename }));
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
      .then(async () => {
        await zipFileWriter.getData().then((zipFileBlob) => {
          saveBlob(zipFileBlob, "chords.zip");
        });
      })
      .catch(console.error);
  }, []);

  const combinations = notes.map((note) =>
    variants.map((ext) => {
      const chordName = fixChordName(note + ext);
      return {
        chordName,
        chords: allChords[chordName],
        defaultIndex: defaultIndices[chordName],
        ext,
        note,
      };
    })
  );
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container gap={2} spacing={1}>
        <Card>
          <CardHeader title={"Chord-Selection"} />
          <CardContent>
            <FormGroup>
              <Select multiple onChange={notesChanged} value={notes}>
                {allNotes.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
              <Autocomplete
                multiple
                onChange={variantsChanged}
                options={allVariants}
                // eslint-disable-next-line react/jsx-no-bind
                renderInput={(params) => (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        maxWidth: "500px",
                      }}
                    >
                      {params.InputProps.startAdornment}
                    </div>
                    <TextField
                      {...params}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: undefined,
                      }}
                      label="Chord-variants"
                      multiline
                      placeholder="Search variants..."
                      variant="standard"
                    />
                  </>
                )}
                value={variants}
              >
                {/* {allVariants.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n === "" ? "Dur" : n}
                  </MenuItem>
                ))} */}
              </Autocomplete>
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
                    checked={settings.extraSettings.showFingerings}
                    onClick={toggleShowNoteFingerings}
                  />
                }
                label="Show fingering"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.extraSettings.showNoteNames}
                    onClick={toggleShowNoteNames}
                  />
                }
                label="Show notes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.germanNotation}
                    onClick={toggleGermanNotation}
                  />
                }
                label="German notation (B->H)"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={settings.showTitle}
                    onClick={toggleShowTitle}
                  />
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
                aria-controls="panel1-content"
                expandIcon={<ExpandMoreIcon />}
                id="panel1-header"
              >
                Expand
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  autoComplete="off"
                  component="form"
                  noValidate
                  sx={{
                    "& .MuiTextField-root": { m: 1, width: "25ch" },
                  }}
                >
                  {Object.keys(settings.displaySettings).map((key) => (
                    <Setting
                      Key={key as keyof ChordSettings}
                      key={key}
                      onChange={setDisplaySetting}
                      value={
                        settings.displaySettings[key as keyof ChordSettings]
                      }
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Grid>
      <br />
      <Grid columns={variants.length} container spacing={1}>
        {combinations.flat().map(({ chordName, chords, defaultIndex }) => (
          <Grid key={chordName} size={1}>
            <Paper
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle2">
                {settings.germanNotation
                  ? normal2germanNotation(chordName)
                  : chordName}
              </Typography>
              <ReactChords
                chords={chords}
                defaultIndex={defaultIndex}
                extraSettings={settings.extraSettings}
                germanNotation={settings.germanNotation}
                removeTitle={!settings.showTitle}
                settings={settings.displaySettings}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Button onClick={downloadAll}>Download all</Button>
    </Box>
  );
}

export default App;

const Setting: React.FC<{
  Key: keyof ChordSettings;
  onChange: (
    key: keyof ChordSettings,
    value: string[] | boolean | number | string
  ) => void;
  value?: FretMarker[] | number[] | string[] | boolean | number | string;
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
    (e: SelectChangeEvent) => {
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
      <Select onChange={_onChange2} value={value as string}>
        <MenuItem value={ChordStyle.normal}>Normal</MenuItem>
        <MenuItem value={ChordStyle.handdrawn}>Handdrawn</MenuItem>
      </Select>
    );
  } else if (Key === "orientation") {
    return (
      <Select onChange={_onChange2} value={value as string}>
        <MenuItem value={Orientation.vertical}>Vertical</MenuItem>
        <MenuItem value={Orientation.horizontal}>Horizontal</MenuItem>
      </Select>
    );
  } else if (Key === "fretLabelPosition") {
    return (
      <Select onChange={_onChange2} value={value as string}>
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
      <MuiColorInput
        format="hex"
        label={Key}
        onChange={handleColorChange}
        value={value}
      />
    );
  }
  return (
    <TextField
      label={Key}
      onChange={_onChange}
      type={
        typeof value === "number"
          ? "number"
          : typeof value === "boolean"
          ? "checkbox"
          : "text"
      }
      value={value}
    />
  );
};
