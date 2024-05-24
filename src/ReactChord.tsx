import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SVGuitarChord,
  ChordSettings,
  Chord,
  ChordStyle,
  Orientation,
  FretLabelPosition,
  Finger,
} from "svguitar";
import { chord2filename, translateChordname } from "./chords";
import { chordName2id, saveSvg } from "./helper";
import { Box, Button, Modal, Typography } from "@mui/material";
import { Editor, OnChange, OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";

const defaultSettings: ChordSettings = {
  // Customizations (all optional, defaults shown)

  /**
   * Orientation of the chord diagram. Chose between 'vertical' or 'horizontal'
   */
  orientation: Orientation.vertical,

  /**
   * Select between 'normal' and 'handdrawn'
   */
  style: ChordStyle.normal,

  /**
   * The number of strings
   */
  strings: 6,

  /**
   * The number of frets
   */
  frets: 5,

  /**
   * Default position if no positon is provided (first fret is 1)
   */
  position: 1,

  // /**
  //  * These are the labels under the strings. Can be any string.
  //  */
  // tuning: ["E", "A", "D", "G", "B", "E"],

  /**
   * The position of the fret label (eg. "3fr")
   */
  fretLabelPosition: FretLabelPosition.RIGHT,

  /**
   * The font size of the fret label
   */
  fretLabelFontSize: 38,

  /**
   * The font size of the string labels
   */
  tuningsFontSize: 20,

  /**
   * Size of a finger or barre relative to the string spacing
   */
  fingerSize: 0.65,

  /**
   * Color of a finger or barre
   */
  fingerColor: "#000",

  /**
   * The color of text inside fingers and barres
   */
  fingerTextColor: "#FFF",

  /**
   * The size of text inside fingers and barres
   */
  fingerTextSize: 22,

  /**
   * stroke color of a finger or barre. Defaults to the finger color if not set
   */
  fingerStrokeColor: "#000000",

  /**
   * stroke width of a finger or barre
   */
  fingerStrokeWidth: 0,

  /**
   * stroke color of a barre chord. Defaults to the finger color if not set
   */
  barreChordStrokeColor: "#000000",

  /**
   * stroke width of a barre chord
   */
  barreChordStrokeWidth: 0,

  /**
   * Height of a fret, relative to the space between two strings
   */
  fretSize: 1,

  /**
   * The minimum side padding (from the guitar to the edge of the SVG) relative to the whole width.
   * This is only applied if it's larger than the letters inside of the padding (eg the starting fret)
   */
  sidePadding: 0.2,

  /**
   * The font family used for all letters and numbers
   */
  fontFamily: "Arial",

  // /**
  //  * Default title of the chart if no title is provided
  //  */
  // title: "F# minor",

  /**
   * Font size of the title. This is only the initial font size. If the title doesn't fit, the title
   * is automatically scaled so that it fits.
   */
  titleFontSize: 48,

  /**
   * Space between the title and the chart
   */
  titleBottomMargin: 0,

  /**
   * Global color of the whole chart. Can be overridden with more specifig color settings such as
   * @link titleColor or @link stringColor etc.
   */
  color: "#000000",

  /**
   * The background color of the chord diagram. By default the background is transparent. To set the background to transparent either set this to 'none' or undefined
   */
  backgroundColor: "none",

  /**
   * Barre chord rectangle border radius relative to the fingerSize (eg. 1 means completely round endges, 0 means not rounded at all)
   */
  barreChordRadius: 0.5,

  /**
   * Size of the Xs and Os above empty strings relative to the space between two strings
   */
  emptyStringIndicatorSize: 0.6,

  /**
   * Global stroke width
   */
  strokeWidth: 2,

  /**
   * The width of the nut (only used if position is 1)
   */
  nutWidth: 10,

  /**
   * If this is set to `true`, the starting fret (eg. 3fr) will not be shown. If the position is 1 the
   * nut will have the same width as all other frets.
   */
  noPosition: false,

  // /**
  //  * The color of the title (overrides color)
  //  */
  // titleColor: "#000000",

  // /**
  //  * The color of the strings (overrides color)
  //  */
  // stringColor: "#000000",

  // /**
  //  * The color of the fret position (overrides color)
  //  */
  // fretLabelColor: "#000000",

  // /**
  //  * The color of the tunings (overrides color)
  //  */
  // tuningsColor: "#000000",

  // /**
  //  * The color of the frets (overrides color)
  //  */
  // fretColor: "#000000",

  /**
   * When set to true the distance between the chord diagram and the top of the SVG stayes the same,
   * no matter if a title is defined or not.
   */
  fixedDiagramPosition: false,

  // /**
  //  * Text of the watermark (text on the bottom of the chart)
  //  */
  // watermark: "some watermark",

  /**
   * Font size of the watermark
   */
  watermarkFontSize: 12,

  /**
   * Color of the watermark (overrides color)
   */
  watermarkColor: "#000000",

  /**
   * Font-family of the watermark (overrides fontFamily)
   */
  watermarkFontFamily: "Arial",

  // /**
  //  * The title of the SVG. This is not visible in the SVG, but can be used for accessibility.
  //  */
  // svgTitle: "Guitar chord diagram of F# minor",
};

const useSVGuitarChord = (
  id: string,
  chord: Chord,
  options: {
    settings?: Partial<ChordSettings>;
    extraSettings?: ChordExtraSettings;
    germanNotation?: boolean;
    removeTitle?: boolean;
  }
) => {
  const [chart, setChart] = useState<SVGuitarChord>();

  useEffect(() => {
    const query = "#" + id;
    if (document.querySelector(query)) {
      const c = new SVGuitarChord(query);
      setChart(c);
      return () => {
        c.remove();
        setChart(undefined);
      };
    }
  }, [id]);

  useEffect(() => {
    // draw the chart
    if (chart)
      drawSvg(
        chart,
        { ...chord, barres: chord.barres ?? [], fingers: chord.fingers ?? [] },
        options
      );
  }, [chart, chord, options]);
};

export interface ChordExtraSettings {
  showNoteNames: boolean;
  showFingerings: boolean;
}

const defaultChordExtraSettings: ChordExtraSettings = {
  showNoteNames: true,
  showFingerings: true,
};
type ChordPlus = Chord & { tuning?: string[] };

interface Props {
  chord: ChordPlus;
  settings?: Partial<ChordSettings>;
  extraSettings?: ChordExtraSettings;
  germanNotation?: boolean;
  removeTitle?: boolean;
  fileAppendix?: string;
}

const configureChordSettings = (
  chord: ChordPlus,
  options: {
    germanNotation?: boolean;
    removeTitle?: boolean;
    settings?: Partial<ChordSettings>;
    extraSettings?: Partial<ChordExtraSettings>;
  }
): ChordSettings => {
  const extraSettings = {
    ...defaultChordExtraSettings,
    ...options.extraSettings,
  };
  return {
    ...defaultSettings,
    tuning: !extraSettings.showNoteNames
      ? undefined
      : options.germanNotation
      ? chord.tuning?.map((t) => translateChordname(t))
      : chord.tuning,
    svgTitle: chord.title
      ? `Guitar chord diagram of ${
          options.germanNotation ? translateChordname(chord.title) : chord.title
        }`
      : undefined,
    ...options.settings,
  };
};

const configureChord = (
  chord: ChordPlus,
  options: {
    germanNotation?: boolean;
    removeTitle?: boolean;
    settings?: Partial<ChordSettings>;
    extraSettings?: Partial<ChordExtraSettings>;
  }
): ChordPlus => {
  const extraSettings = {
    ...defaultChordExtraSettings,
    ...options.extraSettings,
  };
  return {
    ...chord,
    title:
      options.removeTitle || !chord.title
        ? undefined
        : translateChordname(chord.title),
    // // @ts-expect-error tuning is actually a valid key
    // tuning: extraSettings.showFingerings ? chord.tuning : undefined,
    fingers: extraSettings.showFingerings
      ? chord.fingers
      : chord.fingers.map((f) => [f[0], f[1]] as Finger),
    barres: extraSettings.showFingerings
      ? chord.barres
      : chord.barres.map((b) => ({ ...b, text: undefined })),
    tuning: extraSettings.showNoteNames ? chord.tuning : undefined,
  };
};
const drawSvg = (
  chart: SVGuitarChord,
  chord: Chord,
  options: {
    germanNotation?: boolean;
    removeTitle?: boolean;
    settings?: Partial<ChordSettings>;
    extraSettings?: Partial<ChordExtraSettings>;
  }
) => {
  chart.configure(configureChordSettings(chord, options)).chord(chord).draw();
};

const ReactChord: React.FC<Props> = ({
  settings,
  chord,
  germanNotation,
  removeTitle = true,
  fileAppendix = "",
  extraSettings,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);
  const [chordState, _setChordState] = useState<ChordPlus>(chord);
  const [chordStateStr, _setChordStateStr] = useState<string>(
    JSON.stringify(chord, null, 4)
  );
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
  const setChordState = useCallback((chord: ChordPlus, resetEditor = false) => {
    try {
      const chordStr = JSON.stringify(chord, null, 4);
      _setChordStateStr(chordStr);
      _setChordState(chord);
      if (resetEditor) {
        editorRef.current?.getModel()?.setValue(chordStr);
      }
    } catch {
      console.log("JSON malformed");
    }
  }, []);
  useEffect(() => {
    setChordState(
      configureChord(chord, {
        settings,
        extraSettings,
        germanNotation,
        removeTitle,
      })
    );
  }, [
    chord,
    setChordState,
    extraSettings,
    germanNotation,
    removeTitle,
    settings,
  ]);
  const setChordStateByString: OnChange = useCallback((e) => {
    if (e)
      try {
        // setChordState(JSON.parse(e));
        _setChordStateStr(e);
        _setChordState(JSON.parse(e));
      } catch {
        console.log("ups");
      }
  }, []);
  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
  }, []);

  const id = useMemo(
    () => chordName2id(String(chord.title) ?? "chart"),
    [chord.title]
  );
  const id2 = useMemo(
    () => (!open ? "x" : chordName2id(String(chord.title) ?? "chart") + "---2"),
    [open, chord.title]
  );
  useSVGuitarChord(id, chordState, {
    settings,
    extraSettings,
    germanNotation,
    removeTitle,
  });

  useSVGuitarChord(id2, chordState, {
    settings,
    extraSettings,
    germanNotation,
    removeTitle,
  });
  const download = () => {
    //get svg element.
    saveSvg(
      ref.current?.children[0] as SVGSVGElement,
      chord2filename(chordState, fileAppendix, germanNotation)
    );
  };

  return (
    <>
      <div
        id={`${id}`}
        className={`svg-wrapper ${id}${fileAppendix}`}
        style={{ cursor: "pointer" }}
        onClick={handleOpen}
        // ref={ref}
      ></div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        keepMounted
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {id}
          </Typography>
          <div
            id={`${id2}`}
            className={`svg-wrapper ${id}${fileAppendix}`}
            style={{ cursor: "pointer" }}
            // onClick={handleOpen}
            ref={ref}
          ></div>
          <Editor
            key={`${id}${fileAppendix}`}
            width="100%"
            height="600px"
            defaultLanguage="json"
            theme="vs-dark"
            // defaultValue={chordStateStr}
            value={chordStateStr}
            // options={options}
            onChange={setChordStateByString}
            onMount={handleEditorDidMount}
            // editorDidMount={::this.editorDidMount}
          />
          <Button onClick={download}>Download</Button>
        </Box>
      </Modal>
    </>
  );
};

export default ReactChord;
