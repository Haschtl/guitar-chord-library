import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type ChordSettings,
  ChordStyle,
  FretLabelPosition,
  Orientation,
} from "svguitar";
import { z } from "zod";

import {
  type ChordExtraSettings,
  zChordExtraSettings,
} from "../lib/ReactChord";

export const zSettings = z.object({
  displaySettings: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()])
  ),
  extraSettings: zChordExtraSettings,
  germanNotation: z.boolean().default(false),
  showTitle: z.boolean().default(true),
});
type Settings = Omit<z.infer<typeof zSettings>, "displaySettings"> & {
  displaySettings: Partial<ChordSettings>;
};

export const defaultSettings: Settings = {
  displaySettings: {
    barreChordRadius: 0.5,
    barreChordStrokeColor: "#000000",
    barreChordStrokeWidth: 0,
    color: "#000000",
    emptyStringIndicatorSize: 0.6,
    fingerColor: "#000",
    fingerSize: 0.65,
    fingerStrokeColor: "#000000",
    fingerStrokeWidth: 0,
    fingerTextColor: "#FFF",
    fingerTextSize: 22,
    fixedDiagramPosition: false,
    fontFamily: "Arial",
    fretLabelFontSize: 38,
    fretLabelPosition: FretLabelPosition.RIGHT,
    fretSize: 1,
    frets: 5,
    noPosition: false,
    nutWidth: 10,
    orientation: Orientation.vertical,
    sidePadding: 0.2,
    strokeWidth: 2,
    style: ChordStyle.normal,
    titleBottomMargin: 0,
    // titleColor: "",
    titleFontSize: 48,
    tuningsFontSize: 20,
    watermarkColor: "#000000",
    watermarkFontFamily: "Arial",
    watermarkFontSize: 12,
  },
  extraSettings: {
    showFingerings: true,
    showNoteNames: true,
  },
  germanNotation: false,
  showTitle: false,
};

// Context-Typen
interface SettingsContextType {
  notes: string[];
  reset: () => void;
  setDisplaySetting: (
    key: keyof ChordSettings,
    value: string[] | boolean | number | string
  ) => void;
  setExtraSetting: (key: keyof ChordExtraSettings, value: boolean) => void;
  setNotes: (notes: string[]) => void;
  setVariants: (variants: string[]) => void;
  settings: Settings;
  toggleGermanNotation: () => void;
  toggleShowNoteFingerings: () => void;
  toggleShowNoteNames: () => void;
  toggleShowTitle: () => void;
  updateSettings: (newSettings: Partial<Settings>) => void;
  variants: string[];
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<Settings>(() => {
    const storedSettings = localStorage.getItem("app-settings");
    return storedSettings
      ? zSettings.safeParse(JSON.parse(storedSettings)).data ?? {
          ...defaultSettings,
        }
      : { ...defaultSettings };
  });

  useEffect(() => {
    localStorage.setItem("app-settings", JSON.stringify(settings));
  }, [settings]);
  const reset = useCallback(() => {
    setSettings({ ...defaultSettings });
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };
  const setDisplaySetting = useCallback(
    (key: keyof ChordSettings, value: string[] | boolean | number | string) => {
      setSettings((prev) => ({
        ...prev,
        displaySettings: { ...prev.displaySettings, [key]: value },
      }));
    },
    []
  );
  const setExtraSetting = useCallback(
    (key: keyof ChordExtraSettings, value: boolean) => {
      setSettings((prev) => ({
        ...prev,
        extraSettings: { ...prev.extraSettings, [key]: value },
      }));
    },
    []
  );

  const toggleGermanNotation = useCallback(() => {
    setSettings((prev) => ({ ...prev, germanNotation: !prev.germanNotation }));
  }, []);
  const toggleShowTitle = useCallback(() => {
    setSettings((prev) => ({ ...prev, showTitle: !prev.showTitle }));
  }, []);

  const toggleShowNoteNames = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      extraSettings: {
        ...prev.extraSettings,
        showNoteNames: !prev.extraSettings.showNoteNames,
      },
    }));
  }, []);

  const toggleShowNoteFingerings = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      extraSettings: {
        ...prev.extraSettings,
        showFingerings: !prev.extraSettings.showFingerings,
      },
    }));
  }, []);

  const [notes, setNotes] = useState([
    "A",
    // "A#",
    "B",
    "C",
    // "C#",
    "D",
    // "D#",
    "E",
    "F",
    // "F#",
    "G",
    // "G#",
  ]);
  const [variants, setVariants] = useState([
    "",
    "7",
    "maj7",
    "6",
    "m",
    "m7",
    "m6",
    "5",
    // "7b5",
    // "sus2",
    // "sus4",
    // "dim",
    // "9",
    // "aug",
    // "maj9",
    // "maj11",
    // "add9",
    // "dim7",
  ]);
  const value = useMemo(
    () => ({
      notes,
      reset,
      setDisplaySetting,
      setExtraSetting,
      setNotes,
      setVariants,
      settings,
      toggleGermanNotation,
      toggleShowNoteFingerings,
      toggleShowNoteNames,
      toggleShowTitle,
      updateSettings,
      variants,
    }),
    [
      setDisplaySetting,
      setExtraSetting,
      settings,
      toggleGermanNotation,
      toggleShowNoteFingerings,
      toggleShowNoteNames,
      toggleShowTitle,
      updateSettings,
      variants,
      setVariants,
      notes,
      setNotes,
      reset,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
