import { createContext, useContext, useEffect, useState } from "react";
import { Chords, loadChords } from "./chords";

const chordsDatabase = createContext<Chords | null>(null);

interface Props {
  children?: React.ReactNode;
}

export const ChordsProvider: React.FC<Props> = ({ children }) => {
  // console.log(allChordNames);
  const [allChords, setAllChords] = useState<Chords>({});
  useEffect(() => {
    loadChords().then((chords) => setAllChords(chords));
  }, []);

  return (
    <chordsDatabase.Provider value={allChords}>
      {children}
    </chordsDatabase.Provider>
  );
};

export const useChords = () => {
  return useContext(chordsDatabase);
};
