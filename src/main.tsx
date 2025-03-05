import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";
import { ChordsProvider } from "./context/chords.tsx";
import { SettingsProvider } from "./context/settings.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsProvider>
      <ChordsProvider>
        <App />
      </ChordsProvider>
    </SettingsProvider>
  </React.StrictMode>
);
