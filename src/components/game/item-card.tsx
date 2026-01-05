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
import { useI18n } from '@/locales/client';

interface ItemCardProps {
  item: ItemType;
  index: number;
}

export default function ItemCard({ item, index }: ItemCardProps) {
  const { state, dispatch } = useContext(GameContext);
  const { t } = useI18n();

  if (!state || !dispatch) return null;

  const costMultiplier = item.type === 'bps' ? 1.18 : 1.6;
  const price = Math.floor(item.basePrice * Math.pow(costMultiplier, item.owned));
  const canAfford = state.beans >= price;
  const isOwned = item.owned > 0;

  const placeholder = PlaceHolderImages.find(p => p.id === item.icon);
  const iconSrc = placeholder ? placeholder.imageUrl : "https://picsum.photos/seed/lock/48/48";
  const iconHint = placeholder ? placeholder.imageHint : "lock";

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'BUY_ITEM', payload: index });
  };

  const handleOpenPopup = () => {
    if (isOwned) {
      dispatch({ type: 'TOGGLE_ITEM_POPUP', payload: { isOpen: true, itemIndex: index } });
    }
  };

  return (
    <Card
      className={`p-3 flex items-center justify-between gap-2 transition-all duration-200 relative overflow-hidden ${isOwned ? 'cursor-pointer hover:bg-card/60' : 'bg-muted/50'}`}
      onClick={handleOpenPopup}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative w-12 h-12 flex-shrink-0">
          <Image
            src={iconSrc}
            alt={t(item.id)}
            width={48}
            height={48}
            data-ai-hint={iconHint}
            className={`rounded-md object-contain transition-all ${!isOwned && !canAfford ? 'grayscale' : ''}`}
          />
          {isOwned && (
            <Badge variant="destructive" className="absolute -bottom-1 -right-2 text-xs h-5 px-1.5">{`${t('lv')}.${item.owned}`}</Badge>
          )}
        </div>
        <div className="flex flex-col gap-1 text-left flex-1 min-w-0">
          <p className="font-bold font-headline text-base truncate" title={item.customName || t(item.id)}>
            {item.customName || t(item.id)}
          </p>
          {(isOwned || canAfford) && (
            <p className="text-xs font-bold text-green-600 dark:text-green-400">
              {item.type === 'click' ? t('click_short') : t('sec_short')}: +{formatNum(item.val)}
            </p>
          )}
        </div>
      </div>
      <Button
        onClick={handleBuy}
        disabled={!canAfford}
        className={`flex-shrink-0 min-w-[100px] ${canAfford ? 'bg-green-600 hover:bg-green-700 text-white animate-pulse-bg' : ''}`}
        size="sm"
      >
        {canAfford ? (
          <>
            <span>🫘</span>
            <span>{formatNum(price)}</span>
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            <span>{formatNum(price)}</span>
          </>
        )}
      </Button>
    </Card>
  );
}
