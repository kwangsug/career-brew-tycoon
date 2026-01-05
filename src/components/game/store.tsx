"use client";

import { useContext } from 'react';
import ItemCard from './item-card';
import { GameContext } from './game-provider';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function Store() {
  const { state } = useContext(GameContext);

  return (
    <div className="flex flex-col flex-grow min-h-0">
      <div className="flex-shrink-0 text-left mb-2 pb-2 border-b-2 flex justify-between items-center">
        <h2 className="text-lg font-headline font-extrabold">🛒 Store</h2>
        <span className="text-xs font-bold opacity-80">Keep Growing!</span>
      </div>
      <ScrollArea className="flex-grow pr-2">
        <div className="space-y-3 pb-4">
          {state?.items.map((item, index) => (
            <ItemCard key={item.name} item={item} index={index} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
