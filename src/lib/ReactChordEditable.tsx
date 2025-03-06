import { Editor, type OnChange, type OnMount } from "@monaco-editor/react";
import {
  Button,
  type ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  useColorScheme,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import type { editor } from "monaco-editor";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChordSettings } from "svguitar";

import { chord2filename } from "../chords";
import { chordName2id, saveSvg } from "../helper";
import {
  type ChordExtraSettings,
  type ChordPlus,
  configureChord,
  ReactChord,
  useSVGuitarChord,
} from "./ReactChord";

function useSystemDarkMode(): boolean {
  const getDarkModePreference = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [isDarkMode, setIsDarkMode] = useState(getDarkModePreference());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setIsDarkMode(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isDarkMode;
}

export const hashCode = (value: string) => {
  let chr: number | null = null;
  let hash = 0;
  if (value.length === 0) return hash;
  for (let i = 0; i < value.length; i++) {
    chr = value.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    // Convert to 32bit integer
    hash |= 0;
  }
  return hash.toString(36);
};

function isHexColorLight(hex: string): boolean {
  // HEX in RGB umwandeln
  const hexValue = hex.replace("#", "");
  const r = parseInt(hexValue.substring(0, 2), 16);
  const g = parseInt(hexValue.substring(2, 4), 16);
  const b = parseInt(hexValue.substring(4, 6), 16);

  // Helligkeit berechnen (relative luminance nach W3C)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // Schwellenwert bei ca. 128 (Mitte von 0-255)
  return luminance > 128;
}

interface Props extends ButtonProps {
  chord: ChordPlus;
  extraSettings?: ChordExtraSettings;
  fileAppendix?: string;
  germanNotation?: boolean;
  removeTitle?: boolean;
  settings?: Partial<ChordSettings>;
}

const ReactChordEditable: React.FC<Props> = ({
  settings,
  chord,
  germanNotation,
  removeTitle = true,
  fileAppendix = "",
  extraSettings,
  ...props
}) => {
  const [edited, setEdited] = useState(false);
  const [open, setOpen] = useState(false);
  const [chordState, setChordState] = useState<ChordPlus>(chord);
  const [chordStateStr, setChordStateStr] = useState<string>(
    JSON.stringify(chord, null, 4)
  );
  const ref = useRef<HTMLDivElement>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor>(null);

  const id = useMemo(
    () => chordName2id(String(chord.title ?? "chart")),
    [chord.title]
  );
  // const id2 = useMemo(
  //   () =>
  //     !open ? "x" : chordName2id(String(chord.title ?? "chart")) + "-modal",
  //   [open, chord.title]
  // );

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);
  // const configuredChordState = useMemo(
  //   () =>
  //     configureChord(chordState, {
  //       settings,
  //       extraSettings,
  //       germanNotation,
  //       removeTitle,
  //     }),
  //   [chordState, extraSettings, germanNotation, removeTitle, settings]
  // );
  const setAllChordStates = useCallback((chord: ChordPlus) => {
    try {
      const chordStr = JSON.stringify(chord, null, 4);
      setChordStateStr(chordStr);
      setChordState(chord);
      setEdited(false);
      // if (resetEditor) {
      //   editorRef.current?.getModel()?.setValue(chordStr);
      // }
    } catch {
      console.error("JSON malformed");
    }
  }, []);
  const reset = useCallback(() => {
    setAllChordStates(
      configureChord(chord, {
        extraSettings,
        germanNotation,
        removeTitle,
        settings,
      })
    );
  }, [
    chord,
    setAllChordStates,
    extraSettings,
    germanNotation,
    removeTitle,
    settings,
  ]);
  const download = useCallback(() => {
    //get svg element.
    saveSvg(
      ref.current?.children[0] as SVGSVGElement,
      chord2filename(
        chordState,
        !edited
          ? fileAppendix
          : fileAppendix.replace(".svg", "") +
              "-" +
              hashCode(JSON.stringify(chordState)) +
              ".svg",
        false
        // germanNotation
      )
    );
  }, [chordState, edited, fileAppendix, germanNotation]);
  const setChordStateByString: OnChange = useCallback(
    (e) => {
      if (e && e !== chordStateStr)
        try {
          // setAllChordStates(JSON.parse(e));
          setChordStateStr(e);
          setChordState(JSON.parse(e) as ChordPlus);
          setEdited(true);
        } catch {
          console.error("ups");
        }
    },
    [chordStateStr]
  );

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  useSVGuitarChord(id, chordState, {
    extraSettings,
    germanNotation,
    removeTitle,
    settings,
  });
  const { mode } = useColorScheme();
  const system = useSystemDarkMode();
  const realMode =
    mode === "system" || mode == null ? (system ? "dark" : "light") : mode;
  const theme = useTheme();
  const smallScreen = useMediaQuery(theme.breakpoints.down("md"));
  // useSVGuitarChord(id2, chordState, {
  //   extraSettings,
  //   germanNotation,
  //   removeTitle,
  //   settings,
  // });
  const isBright = isHexColorLight(settings?.color ?? "black");
  const backgroundColor = isBright
    ? realMode === "dark"
      ? "transparent"
      : "#222222"
    : realMode === "dark"
    ? "#BBBBBB"
    : "transparent";

  return (
    <>
      <Button
        // className={`svg-wrapper ${id}${fileAppendix}`}
        // id={id}
        onClick={handleOpen}
        // style={{ cursor: "pointer" }}
        // type="button"
        // ref={ref}
        {...props}
      >
        <div
          className={`svg-wrapper ${id}`}
          id={id}
          style={{
            backgroundColor,
            textTransform: "none",
            width: "100%",
          }}
        />
        {/* <ReactChord
          chord={chordState}
          fileAppendix={fileAppendix}
          extraSettings={extraSettings}
          germanNotation={germanNotation}
          removeTitle={removeTitle}
          settings={settings}
        /> */}
      </Button>
      <Dialog
        aria-describedby="modal-modal-description"
        aria-labelledby="modal-modal-title"
        fullScreen={smallScreen}
        fullWidth
        onClose={handleClose}
        open={open}
        // keepMounted
      >
        <DialogTitle>{id}</DialogTitle>
        <DialogContent>
          <div
            style={{
              alignItems: "stretch",
              display: "flex",
              flexDirection: smallScreen ? "column" : "row",
            }}
          >
            <div
              style={{
                backgroundColor,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <ReactChord
                chord={chordState}
                extraSettings={extraSettings}
                fileAppendix={fileAppendix}
                germanNotation={germanNotation}
                id={"-modal"}
                ref={ref}
                removeTitle={removeTitle}
                settings={settings}
                style={{
                  alignItems: "center",
                  backgroundColor,
                  display: "flex",
                  // height: "100%",
                  minHeight: "100px",
                  minWidth: "200px",
                  width: "100%",
                }}
              />
            </div>
            {/* <div
            className={`svg-wrapper ${id}${fileAppendix}`}
            id={id2}
            ref={ref}
            style={{ cursor: "pointer" }}
            // onClick={handleOpen}
          /> */}
            <Editor
              defaultLanguage="json"
              // defaultValue={chordStateStr}
              height="600px"
              key={`${id}${fileAppendix}`}
              onChange={setChordStateByString}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              value={chordStateStr}
              width="100%"
              // options={options}
              // editorDidMount={::this.editorDidMount}
            />
          </div>
          <DialogActions>
            <Button disabled={!edited} onClick={reset}>
              Reset
            </Button>
            <Button onClick={download}>Download</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReactChordEditable;
