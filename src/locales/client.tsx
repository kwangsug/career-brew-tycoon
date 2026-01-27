"use client";

import { createInstance } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import { useEffect, useState, createContext, useContext, useCallback } from "react";
import resources from "./resources";

const LANGUAGE_KEY = 'careerBrewLanguage';

const I18nContext = createContext<{
  t: (key: string, options?: any) => string;
  i18n: any;
  language: string;
  setLanguage: (lang: string) => void;
  availableLanguages: string[];
}>({
  t: (key: string) => key,
  i18n: {},
  language: "en",
  setLanguage: () => {},
  availableLanguages: [],
});

export const useI18n = () => useContext(I18nContext);

const languageNames: Record<string, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
};

export const getLanguageName = (code: string) => languageNames[code] || code;

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState("en");
  const availableLanguages = Object.keys(resources);

  useEffect(() => {
    // Check saved preference first
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && availableLanguages.includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      return;
    }

    // Fall back to browser language detection
    const detectedLanguage = navigator.language.split("-")[0];
    setLanguageState(
      availableLanguages.includes(detectedLanguage) ? detectedLanguage : "en"
    );
  }, []);

  const setLanguage = useCallback((lang: string) => {
    if (availableLanguages.includes(lang)) {
      setLanguageState(lang);
      localStorage.setItem(LANGUAGE_KEY, lang);
    }
  }, [availableLanguages]);

  const i18n = createInstance({
    lng: language,
    fallbackLng: "en",
    resources: resources,
  });

  i18n.init();

  const t = i18n.t.bind(i18n);

  return (
    <I18nContext.Provider value={{ t, i18n, language, setLanguage, availableLanguages }}>
        {children}
    </I18nContext.Provider>
  );
}
