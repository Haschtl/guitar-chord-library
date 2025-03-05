// fiix german notation
// fix german-notation file-output
// add Ab,etc variants

import "./App.css";

import { Box, Button } from "@mui/material";
import { BlobReader, BlobWriter, ZipWriter } from "@zip.js/zip.js";
import { useCallback } from "react";

import { ChordGrid } from "./ChordGrid";
import { chordId2name, saveBlob, svgElement2blob } from "./helper";
import { Settings } from "./Settings";

function App() {
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Settings />
      <br />
      <ChordGrid />
      <Button onClick={downloadAll}>Download all</Button>
    </Box>
  );
}

export default App;
