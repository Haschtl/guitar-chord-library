import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChordSettings,
} from "svguitar";
import { chord2filename } from "./chords";
import { chordName2id, saveSvg } from "./helper";
import { Box, Button, Modal, Typography } from "@mui/material";
import { Editor, OnChange, OnMount } from "@monaco-editor/react";
import { editor } from "monaco-editor";
import { ChordExtraSettings, ChordPlus, configureChord, hashCode, useSVGuitarChord } from "./ReactChord";


interface Props {
  chord: ChordPlus;
  settings?: Partial<ChordSettings>;
  extraSettings?: ChordExtraSettings;
  germanNotation?: boolean;
  removeTitle?: boolean;
  fileAppendix?: string;
}

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
  const [edited, setEdited] = useState(false);
  const setChordState = useCallback((chord: ChordPlus) => {
    try {
      const chordStr = JSON.stringify(chord, null, 4);
      _setChordStateStr(chordStr);
      _setChordState(chord);
      setEdited(false);
      // if (resetEditor) {
      //   editorRef.current?.getModel()?.setValue(chordStr);
      // }
    } catch {
      console.error("JSON malformed");
    }
  }, []);
  const reset = useCallback(() => {
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
  useEffect(() => {
    reset();
  }, [reset]);
  const setChordStateByString: OnChange = useCallback(
    (e) => {
      if (e !== chordStateStr)
        if (e)
          try {
            // setChordState(JSON.parse(e));
            _setChordStateStr(e);
            _setChordState(JSON.parse(e));
            setEdited(true);
          } catch {
            console.error("ups");
          }
    },
    [chordStateStr]
  );
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
      chord2filename(
        chordState,
        !edited
          ? fileAppendix
          : fileAppendix.replace(".svg", "") +
              "-"+hashCode(JSON.stringify(chordState)) +
              ".svg",
        germanNotation
      )
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
          <Button onClick={reset} disabled={!edited}>
            Reset
          </Button>
          <Button onClick={download}>Download</Button>
        </Box>
      </Modal>
    </>
  );
};

export default ReactChord;
