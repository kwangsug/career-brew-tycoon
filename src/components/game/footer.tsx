"use client";
import { useContext } from "react";
import { GameContext } from "./game-provider";
import { Button } from "@/components/ui/button";
import { Save, Trash2, Trophy } from "lucide-react";

export default function Footer() {
  const { dispatch } = useContext(GameContext);

  if (!dispatch) return null;

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-2 mt-auto pt-2">
      <Button
        variant="link"
        className="font-bold text-foreground/80"
        onClick={() => dispatch({ type: "TOGGLE_RANKING_MODAL", payload: true })}
      >
        <Trophy className="mr-2 h-4 w-4" /> View Full Rankings
      </Button>
      <div className="flex justify-center gap-4 items-center">
        <Button
          size="sm"
          className="bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => dispatch({ type: "SAVE_GAME", payload: { showToast: true }})}
        >
          <Save className="mr-2 h-4 w-4" /> Save & Update Rank
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => dispatch({ type: "RESET_GAME" })}
        >
          <Trash2 className="mr-1 h-3 w-3" /> Reset
        </Button>
      </div>
    </div>
  );
}
