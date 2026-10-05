import { ReactNode, createContext, useCallback, useContext, useState } from "react";
import { translations, type Language, type TranslationsSchema } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationsSchema;
  format: (template: string, values: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "project_mgmt_lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === "en" || saved === "cs") return saved;
      // Auto-detect Czech / Slovak
      const navLang = navigator.language?.toLowerCase() || "";
      if (navLang.startsWith("cs") || navLang.startsWith("sk")) {
        return "cs";
      }
    } catch {
      // Fallback if localStorage unavailable
    }
    return "cs";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore
    }
  };

  const t: TranslationsSchema = translations[language];

  const format = useCallback((template: string, values: Record<string, string | number>) => {
    let result = template;
    for (const [key, val] of Object.entries(values)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(val));
    }
    return result;
  }, []);

  return <LanguageContext.Provider value={{ language, setLanguage, t, format }}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
