"use client";
import { useContext } from "react";
import { GameContext } from "./game-provider";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Trophy, ShoppingCart } from "lucide-react";
import { useI18n } from "@/locales/client";

export default function Footer() {
  const { state, dispatch } = useContext(GameContext);
  const { t } = useI18n();

  if (!state || !dispatch) return null;

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-2 mt-auto pt-2">
      <div className="flex justify-center gap-4 w-full">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 relative"
          onClick={() => dispatch({ type: "TOGGLE_STORE_MODAL", payload: true })}
        >
          {state.canAffordNewItem && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-xs text-white font-black">N</span>
            </span>
          )}
          <ShoppingCart className="mr-2 h-5 w-5" /> {t('store_title')}
        </Button>
         <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={() => dispatch({ type: "TOGGLE_RANKING_MODAL", payload: true })}
        >
          <Trophy className="mr-2 h-5 w-5" /> {t('realtime_rankings')}
        </Button>
      </div>
      <div className="flex justify-center gap-4 items-center">
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
    </div>
  );
}
