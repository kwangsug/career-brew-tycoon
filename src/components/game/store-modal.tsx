"use client";

import { useContext } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import ItemCard from './item-card';
import { GameContext } from './game-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/locales/client';

export default function StoreModal() {
  const { state, dispatch } = useContext(GameContext);
  const { t } = useI18n();

  const handleClose = () => {
    if (dispatch) {
      dispatch({ type: 'TOGGLE_STORE_MODAL', payload: false });
    }
  };
  
  if (!state) return null;

  return (
    <Dialog open={state.isStoreModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-center">🛒 {t('store_title')}</DialogTitle>
          <DialogDescription className="text-center">{t('store_subtitle')}</DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-3 pb-4">
            {state.items.map((item, index) => (
              <ItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
