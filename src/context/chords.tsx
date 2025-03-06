import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { type Chords, loadChords } from "../chords";

// Context-Typen
interface ChordsContextType {
  chords: Chords;
  defaultIndices: Record<string, number>;
  loading: boolean;
  variants: string[];
}

export const allNotes = [
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
] as const;

const ChordsContext = createContext<ChordsContextType | undefined>(undefined);
const defaultIndices: Record<string, number> = {
  Asus4: 1,
  Bm: 1,
  Bm7: 2,
  Bsus4: 3,
  C6: 1,
  Cmaj7: 1,
  Esus2: 1,
  Esus4: 1,
  F7: 1,
  Fsus2: 2,
  Fsus4: 1,
  Gm: 1,
  Gmaj7: 2,
};

export const ChordsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [chords, setChords] = useState<Chords>({});
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    loadChords()
      .then((chords) => {
        setChords(chords);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = useMemo(
    () => ({
      chords,
      defaultIndices,
      loading,
      variants: Object.keys(chords)
        .filter((c) => c.startsWith(allNotes[1]))
        .map((c) => c.replace(allNotes[1], "")),
    }),
    [chords, loading]
  );
  return (
    <ChordsContext.Provider value={value}>{children}</ChordsContext.Provider>
  );
};

export const useChordLibrary = (): ChordsContextType => {
  const context = useContext(ChordsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
