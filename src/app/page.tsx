"use client";
import React, { useContext } from 'react';
import { GameProvider, GameContext } from '@/components/game/game-provider';
import StatsPanel from '@/components/game/stats-panel';
import GameCanvas from '@/components/game/game-canvas';
import Store from '@/components/game/store';
import Footer from '@/components/game/footer';
import ItemPopup from '@/components/game/item-popup';
import RankingModal from '@/components/game/ranking-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const GameUI = () => {
  const { state, dispatch } = useContext(GameContext);

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
          ☕ Career Brew: Zigzag
        </h1>
        
        <StatsPanel />
        <GameCanvas />
        <Store />
        <Footer />
      </div>

      <ItemPopup />
      <RankingModal />

      <Dialog open={state.isFirstLoad && !state.playerName}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleNameSubmit}>
            <DialogHeader>
              <DialogTitle className='font-headline'>Welcome to Career Brew!</DialogTitle>
              <DialogDescription>
                Enter a nickname to register on the leaderboard.
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
              <Button type="submit">Start Roasting</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
};


export default function Home() {
  return (
    <GameProvider>
      <GameUI />
    </GameProvider>
  );
}
