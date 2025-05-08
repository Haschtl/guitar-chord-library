import { useColorScheme } from "@mui/material";
import { useEffect,useState  } from "react";

export const chordName2id = (name: string) =>
  name.replaceAll("#", "is").replaceAll("/", "_");
export const chordId2name = (name: string) =>
  name.replaceAll("is", "#").replaceAll("_", "/");
export const normalizeChordname = (name: string) =>
  name
    .replaceAll("Ab", "G#")
    .replaceAll("Bb", "A#")
    .replaceAll("Db", "C#")
    .replaceAll("Eb", "D#")
    .replaceAll("Gb", "F#");

export function svgElement2blob(svgEl: SVGSVGElement) {
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const svgData = svgEl.outerHTML;
  const preface = '<?xml version="1.0" standalone="no"?>\r\n';
  return new Blob([preface, svgData], {
    type: "image/svg+xml;charset=utf-8",
  });
}
export function saveSvg(svgEl: SVGSVGElement, name: string) {
  const svgBlob = svgElement2blob(svgEl);
  saveBlob(svgBlob, name);
}
export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
function useSystemDarkMode(): boolean {
  const getDarkModePreference = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [isDarkMode, setIsDarkMode] = useState(getDarkModePreference());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      setIsDarkMode(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isDarkMode;
}

export function useRealColorScheme() {
  const { mode } = useColorScheme();
  const system = useSystemDarkMode();
  const realMode =
    mode === "system" || mode == null ? (system ? "dark" : "light") : mode;
  return realMode;
}

export function isHexColorLight(hex: string): boolean {
  // HEX in RGB umwandeln
  const hexValue = hex.replace("#", "");
  const r = parseInt(hexValue.substring(0, 2), 16);
  const g = parseInt(hexValue.substring(2, 4), 16);
  const b = parseInt(hexValue.substring(4, 6), 16);

  // Helligkeit berechnen (relative luminance nach W3C)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

  // Schwellenwert bei ca. 128 (Mitte von 0-255)
  return luminance > 128;
}
