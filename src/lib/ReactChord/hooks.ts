import { useCallback, useEffect, useRef } from "react";
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
  // const [chart, setChart] = useState<SVGuitarChord>();
  const chart = useRef<SVGuitarChord>(null);
  const ref = useRef<HTMLElement>(null);

  const initChart = useCallback(() => {
    const query = "#" + id;
    const s = document.querySelector(query);
    if (s && s.children.length === 0) {
      ref.current = s as HTMLElement;
      const c = new SVGuitarChord(s as HTMLElement);
      // setChart(c);
      chart.current = c;
      return {
        chart: c,
        cleanup: () => {
          try {
            c.clear();
            c.remove();
          } catch (e) {
            console.warn(e);
          }
          chart.current = null;
          ref.current = null;
          // setChart(undefined);
          // s.innerHTML=""
        },
      };
    }
  }, [id]);
  useEffect(() => initChart()?.cleanup, []);

  useEffect(() => {
    // draw the chart
    // if (!chart) {
    //   initChart();
    // }
    const _chart = chart.current ?? initChart()?.chart;
    if (_chart) {
      drawSvg(
        _chart,
        { ...chord, barres: chord.barres ?? [], fingers: chord.fingers ?? [] },
        options
      );
    } else {
      console.error(`Failed to update chart ${id}`);
    }
    // } else {
  }, [id, chord, options, initChart]);
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
