"use client";
import React, { useContext } from 'react';
import { GameProvider, GameContext } from '@/components/game/game-provider';
import StatsPanel from '@/components/game/stats-panel';
import GameCanvas from '@/components/game/game-canvas';
import StoreModal from '@/components/game/store-modal';
import Footer from '@/components/game/footer';
import ItemPopup from '@/components/game/item-popup';
import RankingModal from '@/components/game/ranking-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { I18nProvider, useI18n } from '@/locales/client';
import { ShoppingCart, Trophy, Save, Trash2 } from 'lucide-react';

const GameUI = () => {
  const { state, dispatch } = useContext(GameContext);
  const { t } = useI18n();

  if (!state) return null; // Or a loading spinner

  const handleNameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('playerName') as string;
    if (name) {
      dispatch({ type: 'SET_PLAYER_NAME', payload: name });
    }
  };

  const backgroundStyles: { [key: number]: string } = {
    0: 'bg-[#fff8e1] text-[#3e2723]',
    1: 'bg-[#fff8e1] text-[#3e2723]',
    2: 'bg-[#fff8e1] text-[#3e2723]',
    3: 'bg-[#e0f2f1] text-[#004d40]',
    4: 'bg-[#e0f2f1] text-[#004d40]',
    5: 'bg-[#e0f2f1] text-[#004d40]',
    6: 'bg-[#e0f2f1] text-[#004d40]',
    7: 'bg-[#fff3e0] text-[#bf360c]',
    8: 'bg-[#fff3e0] text-[#bf360c]',
    9: 'bg-[#fff3e0] text-[#bf360c]',
    10: 'bg-[#fff3e0] text-[#bf360c]',
  };
  const defaultBg = 'bg-[#1a237e] text-white';
  const backgroundClass = backgroundStyles[state.levelIndex] ?? defaultBg;

  return (
    <main className={`flex justify-center h-screen min-h-screen overflow-hidden transition-colors duration-1000 ${backgroundClass}`}>
      <div className="w-full max-w-md h-full flex flex-col p-4 gap-4 overflow-hidden relative">
        <h1 className="text-center text-2xl font-headline font-black whitespace-nowrap overflow-hidden text-ellipsis transition-colors duration-1000">
          ☕ {t('game_title')}
        </h1>
        
        <StatsPanel />
        <GameCanvas />
        <Footer />

        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            className="rounded-full h-14 w-14 shadow-lg relative"
            onClick={() => dispatch({ type: "TOGGLE_STORE_MODAL", payload: true })}
          >
            <ShoppingCart className="h-7 w-7" />
             {state.canAffordNewItem && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 items-center justify-center text-xs text-white font-black">N</span>
              </span>
            )}
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => dispatch({ type: "TOGGLE_RANKING_MODAL", payload: true })}
          >
            <Trophy className="h-7 w-7" />
          </Button>
        </div>
      </div>

      <StoreModal />
      <ItemPopup />
      <RankingModal />

      <Dialog open={state.isFirstLoad && !state.playerName}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleNameSubmit}>
            <DialogHeader>
              <DialogTitle className='font-headline'>{t('welcome_title')}</DialogTitle>
              <DialogDescription>
                {t('welcome_description')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="playerName"
                name="playerName"
                defaultValue={state.defaultPlayerName}
                className="col-span-3"
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit">{t('start_roasting')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
};


export default function Home() {
  return (
    <I18nProvider>
      <GameProvider>
        <GameUI />
      </GameProvider>
    </I18nProvider>
  );
}
