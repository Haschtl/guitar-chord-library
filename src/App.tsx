import "./App.css";

import { AppBar, Button, CssBaseline, Toolbar } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { NavLink, Route, Routes } from "react-router";

import ChordLibrary from "./pages/ChordLibrary";
import { FretboardGenerator } from "./pages/FretboardGenerator";
import StrummingGenerator from "./pages/StrummingGenerator";

const theme = createTheme({
  colorSchemes: {
    dark: true,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main>
        <AppBar position="static" color="inherit">
          <Toolbar>
            {/* <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Chord-Library
            </Typography> */}
            <NavLink to="/">
              <Button>Chord-Library</Button>
            </NavLink>
            <NavLink to="/strumming">
              <Button>Strum-Pattern</Button>
            </NavLink>
            <NavLink to="/fretboard">
              <Button>Fretboard</Button>
            </NavLink>
          </Toolbar>
        </AppBar>
        <br />
        <Routes>
          <Route element={<ChordLibrary />} path="/" />
          <Route element={<StrummingGenerator />} path="/strumming" />
          <Route element={<FretboardGenerator />} path="/fretboard" />
        </Routes>
      </main>
    </ThemeProvider>
  );
}

export default App;
