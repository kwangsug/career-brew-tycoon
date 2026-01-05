"use client";

import Image from 'next/image';
import { useContext } from 'react';
import { GameContext } from './game-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatNum } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import AISuggester from './ai-suggester';
import { useI18n } from '@/locales/client';

export default function ItemPopup() {
  const { state, dispatch } = useContext(GameContext);
  const { t } = useI18n();

  const isOpen = state?.isItemPopupOpen ?? false;
  const itemIndex = state?.currentItemIndex;

  if (itemIndex === null || itemIndex === undefined || !state) {
    return null;
  }

  const item = state.items[itemIndex];
  if (!item) return null;

  const costMultiplier = item.type === 'bps' ? 1.18 : 1.6;
  const price = Math.floor(item.basePrice * Math.pow(costMultiplier, item.owned));
  const canAfford = state.beans >= price;
  const totalEffect = item.val * item.owned;

  const placeholder = PlaceHolderImages.find(p => p.id === item.icon);

  const handleBuy = () => {
    dispatch({ type: 'BUY_ITEM', payload: itemIndex });
  };

  const handleClose = () => {
    dispatch({ type: 'TOGGLE_ITEM_POPUP', payload: { isOpen: false } });
  };
  
  const handleSelectName = (name: string) => {
    dispatch({ type: 'UPDATE_ITEM_NAME', payload: { index: itemIndex, name } });
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-sm animate-pop-in">
        <DialogHeader className="text-center items-center">
          <div className="relative w-20 h-20 mb-4">
            {placeholder && (
              <Image
                src={placeholder.imageUrl}
                alt={t(item.id)}
                width={80}
                height={80}
                data-ai-hint={placeholder.imageHint}
                className="rounded-lg object-contain"
              />
            )}
            <Badge variant="destructive" className="absolute -bottom-2 -right-2 text-sm">{`${t('lv')}.${item.owned}`}</Badge>
          </div>
          <DialogTitle className="font-headline text-2xl">{item.customName || t(item.id)}</DialogTitle>
          <DialogDescription className="text-center">{t(`${item.id}_desc`)}</DialogDescription>
        </DialogHeader>

        <div className="my-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-bold text-muted-foreground">{t('effect_per_level')}</span>
            <span className="font-black text-green-600 dark:text-green-400">+{formatNum(item.val)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-muted-foreground">{t('total_contribution')}</span>
            <span className="font-black text-green-600 dark:text-green-400">+{formatNum(totalEffect)}</span>
          </div>
        </div>

        <Button
          onClick={handleBuy}
          disabled={!canAfford}
          className="w-full h-12 text-lg font-bold"
        >
          <span>🫘</span>
          <span className="ml-2">{formatNum(price)}</span>
          <span className="ml-2">{t('purchase')}</span>
        </Button>
        
        <AISuggester item={item} onSelectName={handleSelectName} />
      </DialogContent>
    </Dialog>
  );
}
