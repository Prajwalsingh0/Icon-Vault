// @ts-nocheck
import { createContext, useContext, useEffect, useState } from "react";

const KEY = "iconvault.theme";
const ThemeContext = createContext(null);

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(theme) {
  const dark = theme === "dark" || (theme === "system" && prefersDark());
  document.documentElement.classList.toggle("dark", dark);
  return dark;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState("system");
  const [ready, setReady] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY) || "system";
    setThemeState(stored);
    setDark(applyTheme(stored));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    setDark(applyTheme(theme));
    localStorage.setItem(KEY, theme);
  }, [theme, ready]);

  useEffect(() => {
    if (!ready || theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setDark(applyTheme("system"));
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, ready]);

  const cycle = () => {
    setThemeState((current) => (current === "light" ? "dark" : current === "dark" ? "system" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, cycle, dark, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used within ThemeProvider");
  return value;
}
