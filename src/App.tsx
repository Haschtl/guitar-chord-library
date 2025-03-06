// fiix german notation
// fix german-notation file-output

import "./App.css";

import { Box, Button, CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";
import { useCallback, useEffect, useState } from "react";

import { ChordGrid } from "./components/ChordGrid";
import { Settings } from "./components/Settings";
import { useChordLibrary } from "./context/chords";
import { chordId2name, saveBlob, svgElement2blob } from "./helper";

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

function App() {
  const { loading } = useChordLibrary();
  const [loadingDelayed, setLoadingDelayed] = useState(loading);
  useEffect(() => {
    if (loading) {
      setLoadingDelayed(true);
      document.body.style.overflow = "hidden";
    } else {
      setTimeout(() => {
        setLoadingDelayed(false);
        document.body.style.overflow = "inherit";
      }, 1000);
    }
  }, [loading]);
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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main>
        <Box sx={{ flexGrow: 1 }}>
          {loadingDelayed && (
            <div
              style={{
                alignItems: "center",
                backdropFilter: "blur(10px)",
                background: "#44444444",
                display: "flex",
                inset: "-1000px",
                justifyContent: "center",
                position: "absolute",
                zIndex: 61436,
              }}
            >
              Loading library...
            </div>
          )}
          <Settings />
          <br />
          <ChordGrid />
          <Button onClick={downloadAll}>Download all</Button>
        </Box>
      </main>
    </ThemeProvider>
  );
}

export default App;
