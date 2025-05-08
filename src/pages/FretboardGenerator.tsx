import { Close } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
} from "@mui/material";
import { useCallback, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import { Setting } from "../components/Settings";
import { isHexColorLight, saveSvg, useRealColorScheme } from "../helper";
import FretboardComponent, {
  defaultFretboardOptions,
  fillFretboard,
} from "../lib/fretboard";

function useFretboardOptions() {
  const [options, setOptions] = useState({ ...defaultFretboardOptions });

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
  const setNoteColor = useCallback(
    (key: keyof typeof options.noteColors, value: string) => {
      setOptions((prev) => ({
        ...prev,
        noteColors: {
          ...prev.noteColors,
          [key]: value,
        },
      }));
    },
    []
  );
  const reset = useCallback(() => {
    setOptions({ ...defaultFretboardOptions });
  }, []);
  return {
    options,
    reset,
    setKey,
    setNoteColor,
    setOptions,
  };
}

export const FretboardGenerator = () => {
  const { t } = useTranslation();
  const { options, setKey, setNoteColor, reset } = useFretboardOptions();
  const [dialogOpen, setDialogOpen] = useState(false);
  const closeDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);
  const openDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const download = useCallback((id: string) => {
    const element = findNearestSvgChild(document.getElementById(id));
    if (element) saveSvg(element, `${id}.svg`);
  }, []);

  const mode = useRealColorScheme();
  const isBright = isHexColorLight(options?.fretColor ?? "black");

  const backgroundColor = isBright
    ? mode === "dark"
      ? "transparent"
      : "#222222"
    : mode === "dark"
    ? "#BBBBBB"
    : "transparent";

  const presets = [
    {
      dots: fillFretboard(15, 6),
      id: "guitar",
      options: {
        ...options,
        tuning: ["E2", "A2", "D3", "G3", "B3", "E4"].reverse(),
      },
      title: t("Guitar Standard Tuning"),
    },
    {
      dots: fillFretboard(15, 6),
      id: "guitar-dd",
      options: {
        ...options,
        tuning: ["D2", "A2", "D3", "G3", "B3", "E4"].reverse(),
      },
      title: t("Guitar Dropped-D Tuning"),
    },
    {
      dots: fillFretboard(15, 4),
      id: "bass4",
      options: {
        ...options,
        tuning: ["E1", "A1", "D2", "G2"].reverse(),
      },
      title: t("Bass (4-String) Standard Tuning"),
    },
    {
      dots: fillFretboard(15, 5),
      id: "bass5",
      options: {
        ...options,
        tuning: ["B1", "E1", "A1", "D2", "G2"].reverse(),
      },
      title: t("Bass (5-String) Standard Tuning"),
    },
    {
      dots: fillFretboard(15, 4),
      id: "ukulele",
      options: {
        ...options,
        tuning: ["G4", "C4", "E4", "A4"].reverse(),
      },
      title: t("Ukulele Standard Tuning"),
    },
  ];
  return (
    <Box sx={{ flexGrow: 1, gap: 4 }}>
      <Grid container gap={2} spacing={1}>
        <Card>
          <CardHeader title={t("Display")} />
          <CardContent>
            <div>
              <Button onClick={openDialog}>{t("Appearance")}</Button>
              <Button onClick={reset}>{t("Reset")}</Button>
            </div>
          </CardContent>
        </Card>

        {presets.map((p) => (
          <Card key={p.id} sx={{ width: "100%" }}>
            <CardHeader title={p.title} />
            <CardContent>
              <div
                style={{
                  backgroundColor,
                  borderRadius: "4px",
                }}
              >
                <FretboardComponent
                  dots={p.dots}
                  id={p.id}
                  options={p.options}
                />
              </div>
              <Button
                // eslint-disable-next-line react/jsx-no-bind
                onClick={() => {
                  download(p.id);
                }}
              >
                <Trans>Download</Trans>
              </Button>
            </CardContent>
          </Card>
        ))}
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
            {Object.entries(options).map(([key, opt]) =>
              typeof opt === "object" ? null : (
                <Setting
                  Key={key as keyof typeof options}
                  key={key}
                  onChange={setKey}
                  value={opt}
                />
              )
            )}

            {Object.entries(options.noteColors).map(([key, opt]) => (
              <Setting
                Key={key as keyof typeof options.noteColors}
                key={key}
                // @ts-expect-error wrongly typed
                onChange={setNoteColor}
                value={opt}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

function findNearestSvgChild(
  element: HTMLElement | null
): SVGSVGElement | null {
  if (element == null) {
    return null;
  }
  if (element instanceof SVGSVGElement) {
    return element;
  }
  const children = Array.from(element.children);

  for (const child of children) {
    if (child instanceof SVGSVGElement) {
      return child;
    }
    const nestedSvg = findNearestSvgChild(child as HTMLElement);
    if (nestedSvg) {
      return nestedSvg;
    }
  }

  return null;
}
