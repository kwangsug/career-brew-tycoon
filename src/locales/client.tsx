"use client";

import { createInstance } from "i18next";
import { useEffect, useState, createContext, useContext } from "react";
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
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // Auto-detect browser language (ko, ja → use it, otherwise → en)
    const detectedLanguage = navigator.language.split("-")[0];
    const lang = SUPPORTED_LANGUAGES.includes(detectedLanguage) ? detectedLanguage : "en";
    setLanguage(lang);
  }, []);

  // Update HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const i18n = createInstance({
    lng: language,
    fallbackLng: "en",
    resources: resources,
  });

  i18n.init();

  const t = i18n.t.bind(i18n);

  return (
    <I18nContext.Provider value={{ t, i18n, language }}>
        {children}
    </I18nContext.Provider>
  );
}
