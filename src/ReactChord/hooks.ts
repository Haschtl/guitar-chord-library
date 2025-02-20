import { useCallback, useEffect, useState } from "react";
import { type Chord, type ChordSettings, SVGuitarChord } from "svguitar";

import { configureChordSettings } from "./settings";
import type { ChordExtraSettings } from "./types";

export const useSVGuitarChord = (
  id: string,
  chord: Chord,
  options: {
    extraSettings?: ChordExtraSettings;
    germanNotation?: boolean;
    removeTitle?: boolean;
    settings?: Partial<ChordSettings>;
  }
) => {
  const [chart, setChart] = useState<SVGuitarChord>();

  const initChart = useCallback(() => {
    const query = "#" + id;
    const s = document.querySelector(query);
    if (s && s.children.length === 0) {
      const c = new SVGuitarChord(query);
      setChart(c);
      return {
        chart,
        cleanup: () => {
          try {
            c.clear();
            c.remove();
          } catch (e) {
            console.warn(e);
          }
          setChart(undefined);
          // s.innerHTML=""
        },
      };
    }
  }, [id]);
  useEffect(() => initChart()?.cleanup, [initChart]);

  useEffect(() => {
    // draw the chart
    // if (!chart) {
    //   initChart();
    // }
    const _chart = chart ?? initChart()?.chart;
    if (_chart)
      drawSvg(
        _chart,
        { ...chord, barres: chord.barres ?? [], fingers: chord.fingers ?? [] },
        options
      );
    // } else {
    //   console.error(`Failed to update chart ${id}`);
  }, [id, chart, chord, options, initChart]);
};

const drawSvg = (
  chart: SVGuitarChord,
  chord: Chord,
  options: {
    extraSettings?: Partial<ChordExtraSettings>;
    germanNotation?: boolean;
    removeTitle?: boolean;
    settings?: Partial<ChordSettings>;
  }
) => {
  chart.configure(configureChordSettings(chord, options)).chord(chord).draw();
};
