"use client";
import { useContext } from "react";
import { GameContext } from "./game-provider";
import { Button } from "@/components/ui/button";
import { Save, Trash2 } from "lucide-react";
import { useI18n } from "@/locales/client";

export default function Footer() {
  const { state, dispatch } = useContext(GameContext);
  const { t } = useI18n();

  if (!state || !dispatch) return null;

  return (
    <div className="flex-shrink-0 flex justify-center gap-4 items-center mt-auto pt-2">
      <Button
        size="sm"
        className="bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={() => dispatch({ type: "SAVE_GAME", payload: { showToast: true }})}
      >
        <Save className="mr-2 h-4 w-4" /> {t('save_and_rank')}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground"
        onClick={() => dispatch({ type: "RESET_GAME" })}
      >
        <Trash2 className="mr-1 h-3 w-3" /> {t('reset')}
      </Button>
    </div>
  );
}
