/* eslint-disable sort-keys-fix/sort-keys-fix */
/* eslint-disable sort-keys */
import {
  type ChordSettings,
  ChordStyle,
  type Finger,
  FretLabelPosition,
  Orientation,
} from "svguitar";

import { normal2germanNotation } from "../../chords";
import type { ChordExtraSettings, ChordPlus } from "./types";

export const defaultSettings: ChordSettings = {
  /**
   * stroke color of a barre chord. Defaults to the finger color if not set
   */
  barreChordStrokeColor: "#000000",

  /**
   * stroke width of a barre chord
   */
  barreChordStrokeWidth: 0,

  /**
   * Color of a finger or barre
   */
  fingerColor: "#000",

  /**
   * Size of a finger or barre relative to the string spacing
   */
  fingerSize: 0.65,

  /**
   * The background color of the chord diagram. By default the background is transparent. To set the background to transparent either set this to 'none' or undefined
   */
  backgroundColor: "none",

  /**
   * stroke color of a finger or barre. Defaults to the finger color if not set
   */
  fingerStrokeColor: "#000000",

  /**
   * Barre chord rectangle border radius relative to the fingerSize (eg. 1 means completely round endges, 0 means not rounded at all)
   */
  barreChordRadius: 0.5,

  /**
   * stroke width of a finger or barre
   */
  fingerStrokeWidth: 0,

  /**
   * Global color of the whole chart. Can be overridden with more specifig color settings such as
   * @link titleColor or @link stringColor etc.
   */
  color: "#000000",

  /**
   * The color of text inside fingers and barres
   */
  fingerTextColor: "#FFF",

  /**
   * Size of the Xs and Os above empty strings relative to the space between two strings
   */
  emptyStringIndicatorSize: 0.6,

  /**
   * The font size of the fret label
   */
  fretLabelFontSize: 38,

  /**
   * The size of text inside fingers and barres
   */
  fingerTextSize: 22,

  // /**
  //  * These are the labels under the strings. Can be any string.
  //  */
  // tuning: ["E", "A", "D", "G", "B", "E"],
  /**
   * The position of the fret label (eg. "3fr")
   */
  fretLabelPosition: FretLabelPosition.RIGHT,

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

  /**
   * The number of frets
   */
  frets: 5,

  /**
   * The font family used for all letters and numbers
   */
  fontFamily: "Arial",

  // Customizations (all optional, defaults shown)
  /**
   * Orientation of the chord diagram. Chose between 'vertical' or 'horizontal'
   */
  orientation: Orientation.vertical,

  /**
   * Height of a fret, relative to the space between two strings
   */
  fretSize: 1,

  /**
   * The number of strings
   */
  strings: 6,

  /**
   * If this is set to `true`, the starting fret (eg. 3fr) will not be shown. If the position is 1 the
   * nut will have the same width as all other frets.
   */
  noPosition: false,

  /**
   * Select between 'normal' and 'handdrawn'
   */
  style: ChordStyle.normal,

  /**
   * The width of the nut (only used if position is 1)
   */
  nutWidth: 10,

  /**
   * Default position if no positon is provided (first fret is 1)
   */
  position: 1,

  /**
   * The minimum side padding (from the guitar to the edge of the SVG) relative to the whole width.
   * This is only applied if it's larger than the letters inside of the padding (eg the starting fret)
   */
  sidePadding: 0.2,

  /**
   * Global stroke width
   */
  strokeWidth: 2,

  /**
   * Space between the title and the chart
   */
  titleBottomMargin: 0,

  /**
   * The font size of the string labels
   */
  tuningsFontSize: 20,

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
   * Color of the watermark (overrides color)
   */
  watermarkColor: "#000000",

  /**
   * Font-family of the watermark (overrides fontFamily)
   */
  watermarkFontFamily: "Arial",

  // /**
  //  * Text of the watermark (text on the bottom of the chart)
  //  */
  // watermark: "some watermark",
  /**
   * Font size of the watermark
   */
  watermarkFontSize: 12,

  // /**
  //  * The title of the SVG. This is not visible in the SVG, but can be used for accessibility.
  //  */
  // svgTitle: "Guitar chord diagram of F# minor",
};

export const configureChordSettings = (
  chord: ChordPlus,
  options: {
    extraSettings?: Partial<ChordExtraSettings>;
    germanNotation?: boolean;
    removeTitle?: boolean;
    settings?: Partial<ChordSettings>;
  }
): ChordSettings => {
  const extraSettings = {
    ...defaultChordExtraSettings,
    ...options.extraSettings,
  };
  return {
    ...defaultSettings,
    svgTitle: chord.title
      ? `Guitar chord diagram of ${
          options.germanNotation
            ? normal2germanNotation(chord.title)
            : chord.title
        }`
      : undefined,
    tuning: !extraSettings.showNoteNames
      ? undefined
      : options.germanNotation
      ? chord.tuning?.map((t) => normal2germanNotation(t))
      : chord.tuning,
    ...options.settings,
  };
};

export const defaultChordExtraSettings: ChordExtraSettings = {
  showFingerings: true,
  showNoteNames: true,
};

export const configureChord = (
  chord: ChordPlus,
  options: {
    extraSettings?: Partial<ChordExtraSettings>;
    germanNotation?: boolean;
    removeTitle?: boolean;
    settings?: Partial<ChordSettings>;
  }
): ChordPlus => {
  const extraSettings = {
    ...defaultChordExtraSettings,
    ...options.extraSettings,
  };
  return {
    ...chord,

    barres: extraSettings.showFingerings
      ? chord.barres
      : chord.barres.map((b) => ({ ...b, text: undefined })),

    // // @ts-expect-error tuning is actually a valid key
    // tuning: extraSettings.showFingerings ? chord.tuning : undefined,
    fingers: extraSettings.showFingerings
      ? chord.fingers
      : chord.fingers.map((f) => [f[0], f[1]] as Finger),
    title:
      options.removeTitle === true || !chord.title
        ? undefined
        : normal2germanNotation(chord.title),
    tuning: extraSettings.showNoteNames ? chord.tuning : undefined,
  };
};
