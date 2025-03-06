import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  createFilterOptions,
  TextField,
} from "@mui/material";
import { type SyntheticEvent, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Chord } from "svguitar";

import { normal2germanNotation } from "../chords";
import { allNotes, useChordLibrary } from "../context/chords";
import { useSettings } from "../context/settings";
import ReactChords from "../lib/ReactChords";

const filterOptions = createFilterOptions({
  limit: 100,
  matchFrom: "any",
});
const fixChordName = (name: string) => name;
// return name.replace("#m", "m#");
export function ChordSearch() {
  const { settings } = useSettings();
  const { chords: allChords, defaultIndices, variants } = useChordLibrary();
  //   const [value, setValue] = useState<string | null>(null);
  const [found, setFound] = useState<{
    chords: Chord[];
    index?: number;
  } | null>(null);
  const chordChanged = useCallback(
    (_: SyntheticEvent, value: string[] | string | null) => {
      // setValue(value);
      if (typeof value === "string") {
        setFound({ chords: allChords[value], index: defaultIndices[value] });
      }
    },
    [allChords, defaultIndices]
  );

  const chordNames = useMemo(
    () =>
      variants
        .map((ext) =>
          allNotes.map((note) =>
            settings.germanNotation
              ? normal2germanNotation(fixChordName(note + ext))
              : fixChordName(note + ext)
          )
        )
        .flat(),
    [variants, settings.germanNotation]
  );
  const { t } = useTranslation();
  return (
    <Card sx={{ minWidth: "200px" }}>
      <CardHeader title={t("Search")} />
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          //   height: "100%",
          justifyContent: "space-between",
        }}
      >
        <Autocomplete
          filterOptions={filterOptions}
          // @ts-expect-error wrong typed
          onChange={chordChanged}
          options={chordNames}
          // eslint-disable-next-line react/jsx-no-bind
          renderInput={(params) => (
            <>
              {/* <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            maxWidth: "500px",
                          }}
                        >
                          {params.InputProps.startAdornment}
                        </div> */}
              <TextField
                {...params}
                InputProps={{
                  ...params.InputProps,
                  // startAdornment: undefined,
                }}
                label={t("Search chord")}
                multiline
                placeholder={t("Search chord...")}
                variant="standard"
              />
            </>
          )}
          //   value={variants}
        />
        <ReactChords
          chords={found?.chords}
          defaultIndex={found?.index}
          extraSettings={settings.extraSettings}
          fallback={<div />}
          germanNotation={settings.germanNotation}
          id="single-chord"
          removeTitle={!settings.showTitle}
          settings={settings.displaySettings}
          sx={{ px: "20px" }}
        />
      </CardContent>
    </Card>
  );
}
