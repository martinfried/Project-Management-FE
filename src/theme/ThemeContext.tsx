import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Theme } from "./types";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: Theme.Light | Theme.Dark;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = "project_mgmt_theme";

export function ThemeProvider({ children, defaultTheme = Theme.System }: { children: ReactNode; defaultTheme?: Theme }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === Theme.Light || saved === Theme.Dark || saved === Theme.System) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return defaultTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<Theme.Light | Theme.Dark>(Theme.Light);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      const isDark = theme === Theme.System ? window.matchMedia("(prefers-color-scheme: dark)").matches : theme === Theme.Dark;

      if (isDark) {
        root.classList.add(Theme.Dark);
        setResolvedTheme(Theme.Dark);
      } else {
        root.classList.remove(Theme.Dark);
        setResolvedTheme(Theme.Light);
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === Theme.System) {
        applyTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore
    }
  };

  const toggleTheme = () => {
    if (theme === Theme.Light) {
      setTheme(Theme.Dark);
    } else if (theme === Theme.Dark) {
      setTheme(Theme.System);
    } else {
      setTheme(Theme.Light);
    }
  };

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
