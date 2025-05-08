import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import i18n from "i18next";
import I18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import React from "react";
import ReactDOM from "react-dom/client";
import { initReactI18next } from "react-i18next";

import App from "./App.tsx";
import { ChordsProvider } from "./context/chords.tsx";
import { SettingsProvider } from "./context/settings.tsx";
import de from "./locales/de.json";
import { BrowserRouter } from "react-router";
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .use(I18nextBrowserLanguageDetector)
  .init({
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
    parseMissingKeyHandler: (key: string) => {
      console.log(`No translation found for "${key}"`);
      return key;
    },

    resources: {
      // en: {
      //   translation: {
      //   }
      // },
      de: {
        translation: de,
      },
    },
    supportedLngs: ["de", "en"],
  });

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsProvider>
      <ChordsProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </ChordsProvider>
    </SettingsProvider>
  </React.StrictMode>
);
