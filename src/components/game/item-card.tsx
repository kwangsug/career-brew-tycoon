"use client";

import Image from 'next/image';
import { useContext } from 'react';
import { Lock } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameContext } from './game-provider';
import type { Item as ItemType } from '@/types/game';
import { formatNum } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ItemCardProps {
  item: ItemType;
  index: number;
}

export default function ItemCard({ item, index }: ItemCardProps) {
  const { state, dispatch } = useContext(GameContext);

  if (!state || !dispatch) return null;

  const costMultiplier = item.type === 'bps' ? 1.18 : 1.6;
  const price = Math.floor(item.basePrice * Math.pow(costMultiplier, item.owned));
  const canAfford = state.beans >= price;
  const isUnlocked = item.owned > 0 || canAfford;

  const placeholder = PlaceHolderImages.find(p => p.id === item.icon);
  const iconSrc = isUnlocked && placeholder ? placeholder.imageUrl : "https://picsum.photos/seed/lock/48/48";
  const iconHint = isUnlocked && placeholder ? placeholder.imageHint : "lock";

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'BUY_ITEM', payload: index });
  };

  const handleOpenPopup = () => {
    if (isUnlocked) {
      dispatch({ type: 'TOGGLE_ITEM_POPUP', payload: { isOpen: true, itemIndex: index } });
    }
  };

  return (
    <Card
      className={`p-3 flex items-center justify-between gap-2 transition-all duration-200 relative overflow-hidden ${isUnlocked ? 'cursor-pointer hover:bg-card/60' : 'bg-muted/50 opacity-80'}`}
      onClick={handleOpenPopup}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={iconSrc}
            alt={item.name}
            width={48}
            height={48}
            data-ai-hint={iconHint}
            className={`rounded-md object-contain transition-all ${isUnlocked ? '' : 'grayscale'}`}
          />
          {isUnlocked && item.owned > 0 && (
            <Badge variant="destructive" className="absolute -bottom-1 -right-2 text-xs h-5 px-1.5">{`Lv.${item.owned}`}</Badge>
          )}
        </div>
        <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
          {isUnlocked ? (
            <>
              <p className="font-bold font-headline text-base truncate" title={item.customName || item.name}>
                {item.customName || item.name}
              </p>
              <p className="text-xs font-bold text-green-600 dark:text-green-400">
                {item.type === 'click' ? 'Click' : 'Sec'}: +{formatNum(item.val)}
              </p>
            </>
          ) : (
            <p className="text-sm font-bold text-muted-foreground">???</p>
          )}
        </div>
      </div>
      <Button
        onClick={handleBuy}
        disabled={!canAfford}
        className={`flex-shrink-0 min-w-[100px] ${canAfford ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse-bg' : ''}`}
        size="sm"
      >
        {isUnlocked ? (
          <>
            <span>🫘</span>
            <span>{formatNum(price)}</span>
          </>
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </Button>
    </Card>
  );
}
