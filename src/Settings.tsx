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
  Select,
  type SelectChangeEvent,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { MuiColorInput } from "mui-color-input";
import React, { type ChangeEvent, useCallback } from "react";
import {
  type ChordSettings,
  ChordStyle,
  FretLabelPosition,
  type FretMarker,
  Orientation,
} from "svguitar";

import { allNotes, useChordLibrary } from "./context/chords";
import { useSettings } from "./context/settings";

export function Settings() {
  const {
    settings,
    setDisplaySetting,
    toggleGermanNotation,
    toggleShowNoteFingerings,
    toggleShowNoteNames,
    toggleShowTitle,
    notes,
    variants,
    setNotes,
    setVariants,
    reset,
  } = useSettings();
  const { variants: allVariants } = useChordLibrary();

  const notesChanged = useCallback(
    (e: SelectChangeEvent<string[]>) => {
      setNotes(e.target.value as string[]);
    },
    [setNotes]
  );
  const variantsChanged = useCallback(
    (_: React.SyntheticEvent, values: string[]) => {
      setVariants(values);
    },
    [setVariants]
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
              <Button onClick={reset}>Reset</Button>
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
    </Box>
  );
}

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
