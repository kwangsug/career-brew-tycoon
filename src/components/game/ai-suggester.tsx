"use client";

import { useState, useContext } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAINameSuggestions } from '@/app/actions';
import { GameContext } from './game-provider';
import type { Item } from '@/types/game';

interface AISuggesterProps {
  item: Item;
  onSelectName: (name: string) => void;
}

export default function AISuggester({ item, onSelectName }: AISuggesterProps) {
  const { state } = useContext(GameContext);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestNames = async () => {
    if (!state) return;
    setIsLoading(true);
    setSuggestions([]);
    const level = state.levelIndex + 1;
    const newSuggestions = await getAINameSuggestions(item.name, level);
    setSuggestions(newSuggestions);
    setIsLoading(false);
  };

  return (
    <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
      <h4 className="text-sm font-bold text-center mb-3 text-secondary-foreground">AI Name Suggestions</h4>
      <Button
        onClick={handleSuggestNames}
        disabled={isLoading}
        className="w-full"
        variant="secondary"
      >
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <Wand2 className="mr-2 h-4 w-4" />
        )}
        Suggest Creative Names
      </Button>
      {suggestions.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-2">
          {suggestions.map((name, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => onSelectName(name)}
              className="justify-start text-left h-auto"
            >
              {name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
