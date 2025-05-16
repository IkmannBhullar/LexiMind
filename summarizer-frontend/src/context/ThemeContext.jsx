import { createContext, useContext, useState } from "react";

const ThemeContext = createContext();

const themes = {
  tech: "bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]",
  writer: "bg-gradient-to-br from-[#fdfcfb] via-[#e2d1c3] to-[#a2a2a2]",
  focus: "bg-gradient-to-br from-[#1a1a1a] via-[#2e2e2e] to-[#1a1a1a]",
  contrast: "bg-gradient-to-br from-black via-white to-black",
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("tech");

  const toggleTheme = () => {
    const keys = Object.keys(themes);
    const next = (keys.indexOf(mode) + 1) % keys.length;
    setMode(keys[next]);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, gradient: themes[mode] }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);