"use client";
import { useContext } from "react";
import { GameContext } from "./game-provider";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useI18n, getLanguageName } from "@/locales/client";

export default function Footer() {
  const { state } = useContext(GameContext);
  const { language, setLanguage, availableLanguages } = useI18n();

  if (!state) return null;

  const cycleLanguage = () => {
    const currentIndex = availableLanguages.indexOf(language);
    const nextIndex = (currentIndex + 1) % availableLanguages.length;
    setLanguage(availableLanguages[nextIndex]);
  };

  return (
    <div className="flex-shrink-0 flex justify-center gap-4 items-center mt-auto pt-2">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={cycleLanguage}
      >
        <Globe className="mr-1 h-3 w-3" /> {getLanguageName(language)}
      </Button>
    </div>
  );
}
