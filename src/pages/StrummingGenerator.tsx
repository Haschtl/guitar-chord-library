import "../lib/strum-pattern/src/App.css";

import React, { type ChangeEvent, useCallback, useRef, useState } from "react";

import { saveSvg } from "../lib/strum-pattern/src/helper.ts";
import StrumPatternSvg, {
  defaultStrumOptions,
} from "../lib/strum-pattern/src/StrumPattern.tsx";
import library from "../lib/strum-pattern/src/strumPatternLib.ts";
// import StrumPatternSvg from "./StrumPattern";
// import library from "./strumPatternLib";
import TextStrumPattern, {
  parseKey,
} from "../lib/strum-pattern/src/TextStrumPattern";
import type {
  NoteLength,
  StrumPattern,
  StrumPatternOptions,
} from "../lib/strum-pattern/src/types.ts";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  Input,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { Trans, useTranslation } from "react-i18next";
import { Close } from "@mui/icons-material";
import { Setting } from "../components/Settings.tsx";
import { isHexColorLight, useRealColorScheme } from "../helper.ts";

function useStrumOptions() {
  const [options, setOptions] = useState({ ...defaultStrumOptions });

  const setKey = useCallback(
    (
      key: keyof typeof options,
      value: string[] | boolean | number | string
    ) => {
      setOptions((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    []
  );
  const reset = useCallback(() => {
    setOptions(defaultStrumOptions);
  }, []);
  return {
    options,
    reset,
    setKey,
    setOptions,
  };
}

function StrummingGenerator() {
  const { t } = useTranslation();
  const ref = useRef<SVGSVGElement>(null);
  const [value, setValue] = useState("duaAmM r");
  const [noteLength, setNoteLength] = useState<NoteLength>("1/8");

  const { options, setKey, reset } = useStrumOptions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);
  const openDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }, []);
  const selectNoteLength = useCallback((e: SelectChangeEvent) => {
    setNoteLength(e.target.value as NoteLength);
  }, []);
  const download = useCallback(() => {
    if (ref.current) saveSvg(ref.current, `${value}-${noteLength}.svg`);
  }, [noteLength, value]);
  const onPress = useCallback((key: string) => {
    const { strumText, noteLength } = parseKey(key);
    setValue(strumText);
    setNoteLength(noteLength);
  }, []);
  const mode = useRealColorScheme();
  const isBright = isHexColorLight(options?.arrowColor ?? "black");

  const backgroundColor = isBright
    ? mode === "dark"
      ? "transparent"
      : "#222222"
    : mode === "dark"
    ? "#BBBBBB"
    : "transparent";
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container gap={2} spacing={1}>
        <Grid size={12}>
          <Card>
            <CardHeader title={t("Generator")} />
            <CardContent>
              <div>
                <div
                  style={{
                    borderRadius: "4px",
                    backgroundColor,
                    display: "flex",
                    padding: "4px",
                  }}
                >
                  <TextStrumPattern
                    noteLength={noteLength}
                    options={options}
                    svgRef={ref}
                    text={value}
                  />
                </div>
                <div>
                  <Input onChange={onChange} value={value} />
                  <Button onClick={download} type="button">
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
        <Card>
          <CardHeader title={t("Display")} />
          <CardContent>
            <FormControl fullWidth>
              <InputLabel>
                <Trans>Note length</Trans>
              </InputLabel>
              <Select
                label={t("Note length")}
                onChange={selectNoteLength}
                value={noteLength}
              >
                <MenuItem value="1/4">1/4</MenuItem>
                <MenuItem value="1/8">1/8</MenuItem>
                <MenuItem value="1/4 triplet">
                  <Trans>1/4 triplet</Trans>
                </MenuItem>
                <MenuItem value="1/8 triplet">
                  <Trans>1/8 triplet</Trans>
                </MenuItem>
                <MenuItem value="1/16">1/16</MenuItem>
                <MenuItem value="1/16 triplet">
                  <Trans>1/16 triplet</Trans>
                </MenuItem>
              </Select>
            </FormControl>
            <div>
              <Button onClick={openDialog}>{t("Appearance")}</Button>
              <Button onClick={reset}>{t("Reset")}</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={t("Legend")} />
          <CardContent>
            <Grid container spacing={0} width={300}>
              <Grid size={1}>
                <Typography color="primary" fontWeight={800}>
                  d
                </Typography>
              </Grid>
              <Grid size={11}>
                <Typography align="left">
                  <Trans>Down-stroke</Trans>
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography color="primary" fontWeight={800}>
                  u
                </Typography>
              </Grid>
              <Grid size={11}>
                <Typography align="left">
                  <Trans>Up-stroke</Trans>
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography color="primary" fontWeight={800}>
                  m
                </Typography>
              </Grid>
              <Grid size={11}>
                <Typography align="left">
                  <Trans>Muted down-stroke</Trans>
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography color="primary" fontWeight={800}>
                  M
                </Typography>
              </Grid>
              <Grid size={11}>
                <Typography align="left">
                  <Trans>Muted up-stroke</Trans>
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography color="primary" fontWeight={800}>
                  a
                </Typography>
              </Grid>
              <Grid size={11}>
                <Typography align="left">
                  <Trans>Arpeggio down-stroke</Trans>
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography color="primary" fontWeight={800}>
                  A
                </Typography>
              </Grid>
              <Grid size={11}>
                <Typography align="left">
                  <Trans>Arpeggio up-stroke</Trans>
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography color="primary" fontWeight={800}>
                  ' '
                </Typography>
              </Grid>
              <Grid size={11}>
                <Typography align="left">
                  <Trans>Pause</Trans>
                </Typography>
              </Grid>
              <Grid size={1}>
                <Typography color="primary" fontWeight={800}>
                  r
                </Typography>
              </Grid>
              <Grid size={11}>
                <Typography align="left">
                  <Trans>Rest</Trans>
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography align="left">
                  <Trans>All other characters are displayed directly</Trans>
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={t("Examples")} />
          <CardContent>
            <div className="strum-lib">
              {Object.entries(library).map(([key, sp]) => (
                <StrumButton
                  key={key}
                  name={key}
                  onClick={onPress}
                  options={options}
                  strumPattern={sp}
                  style={{
                    borderRadius: "4px",
                    backgroundColor,
                  }}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Dialog onClose={closeDialog} open={dialogOpen}>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
          <div>{t("Appearance")}</div>
          <IconButton onClick={closeDialog}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            autoComplete="off"
            component="form"
            noValidate
            sx={{
              "& .MuiTextField-root": { m: 1, width: "25ch" },
            }}
          >
            {Object.entries(options).map(([key, opt]) => (
              <Setting
                Key={key as keyof typeof options}
                key={key}
                onChange={setKey}
                value={opt}
              />
            ))}

            {/* <div>
              {Object.entries(options).map(([key, opt]) => (
                <StrumInput Key={key} key={key} onChange={c} option={opt} />
              ))}
            </div> */}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

const StrumButton: React.FC<{
  name: string;
  onClick?: (name: string) => void;
  options?: Partial<StrumPatternOptions>;
  strumPattern: StrumPattern;
  style?: React.CSSProperties;
}> = ({ name, onClick, strumPattern, options, style }) => {
  const _onClick = useCallback(() => {
    onClick?.(name);
  }, [name, onClick]);
  return (
    <button
      className="strum-lib-entry"
      style={style}
      onClick={_onClick}
      type="button"
    >
      <StrumPatternSvg
        height="100%"
        noteLength={strumPattern.noteLength}
        options={options}
        strums={strumPattern.strums}
        width="100%"
      />
    </button>
  );
};
const StrumInput: React.FC<{
  Key: string;
  onChange: (key: string, option: any) => void;
  option: any;
}> = ({ Key, option, onChange }) => {
  const _onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(
        Key,
        e.target.value === "0"
          ? 0
          : isNaN(Number(e.target.value))
          ? e.target.value
          : Number(e.target.value)
      );
    },
    [Key, option, onChange]
  );
  return (
    <div>
      {Key}
      <input onChange={_onChange} value={option} />
    </div>
  );
};

export default StrummingGenerator;
