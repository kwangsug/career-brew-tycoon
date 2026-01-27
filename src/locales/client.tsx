"use client";

import { createInstance } from "i18next";
import { useEffect, useState, createContext, useContext, useMemo } from "react";
import resources from "./resources";

// Supported languages: ko, ja, en (fallback)
const SUPPORTED_LANGUAGES = ["ko", "ja", "en"];

const I18nContext = createContext<{
  t: (key: string, options?: any) => string;
  i18n: any;
  language: string;
}>({
  t: (key: string) => key,
  i18n: {},
  language: "en",
});

export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // Auto-detect browser language (ko, ja → use it, otherwise → en)
    const detectedLanguage = navigator.language.split("-")[0];
    const lang = SUPPORTED_LANGUAGES.includes(detectedLanguage) ? detectedLanguage : "en";
    setLanguage(lang);
    setMounted(true);
  }, []);

  // Update HTML lang attribute
  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  const i18n = useMemo(() => {
    const instance = createInstance({
      lng: language,
      fallbackLng: "en",
      resources: resources,
    });
    instance.init();
    return instance;
  }, [language]);

  const t = useMemo(() => i18n.t.bind(i18n), [i18n]);

  // Prevent hydration mismatch by showing consistent initial state
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ t, i18n, language: "en" }}>
        {children}
      </I18nContext.Provider>
    );
  }

  return (
    <I18nContext.Provider value={{ t, i18n, language }}>
      {children}
    </I18nContext.Provider>
  );
}
