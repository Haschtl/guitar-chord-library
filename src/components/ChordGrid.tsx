import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

import { normal2germanNotation } from "../chords";
import { useChordLibrary } from "../context/chords";
import { useSettings } from "../context/settings";
import { normalizeChordname } from "../helper";
import ReactChords from "../lib/ReactChords";

const fixChordName = (name: string) => name;
// return name.replace("#m", "m#");
export function ChordGrid() {
  const { settings, variants, notes } = useSettings();
  const { chords: allChords, defaultIndices } = useChordLibrary();

  const combinations = notes.map((note) =>
    variants.map((ext) => {
      const chordName = fixChordName(note + ext);
      const norm = normalizeChordname(chordName);
      return {
        chordName,
        chords: allChords[norm]?.map((c) => ({ ...c, title: chordName })) ?? [],
        defaultIndex: defaultIndices[norm],
        ext,
        note,
      };
    })
  );
  return (
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
  );
}
