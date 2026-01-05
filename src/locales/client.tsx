"use client";

import { createInstance } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import { useEffect, useState, createContext, useContext } from "react";
import resources from "./resources";

const I18nContext = createContext<{
  t: (key: string, options?: any) => string;
  i18n: any;
}>({
  t: (key: string) => key,
  i18n: {},
});

export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const detectedLanguage = navigator.language.split("-")[0];
    setLanguage(
      Object.keys(resources).includes(detectedLanguage) ? detectedLanguage : "en"
    );
  }, []);

  const i18n = createInstance({
    lng: language,
    fallbackLng: "en",
    resources: resources,
  });

  i18n.init();

  const t = i18n.t.bind(i18n);

  return (
    <I18nContext.Provider value={{ t, i18n }}>
        {children}
    </I18nContext.Provider>
  );
}
