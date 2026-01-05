"use client";

import React, { createContext, useReducer, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { GameState, GameAction, Item } from '@/types/game';
import { initialItems, levels as levelNames } from '@/lib/game-data';
import { initFirebase, saveToFirebase, fetchMyRank } from '@/lib/firebase';
import { useI18n } from '@/locales/client';

const SAVE_KEY = 'careerBrewSaveV1.0';
const GOLDEN_INTERVAL = 10 * 60 * 1000; // 10 minutes

const adjectives = ["Sleepy", "Happy", "Hungry", "Caffeinated", "Passionate", "Rich", "Poor", "Legendary", "Beginner"];
const nouns = ["Barista", "Developer", "CEO", "Intern", "Landlord", "Addict", "Roaster", "Taster"];
const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
const generateUUID = () => 'user-' + Math.random().toString(36).substring(2, 9);

const initialState: GameState = {
  beans: 0,
  baseBps: 0,
  baseClick: 1,
  manualTotal: 0,
  items: initialItems,
  feverGauge: 0,
  isFever: false,
  lastTime: Date.now(),
  clickScale: 1.0,
  playerName: "",
  defaultPlayerName: randomName,
  playerId: "",
  levels: levelNames,
  levelIndex: 0,
  goldenBean: { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0 },
  nextGoldenTime: Date.now() + GOLDEN_INTERVAL,
  particles: [],
  floatingTexts: [],
  isFirstLoad: false,
  isRankingModalOpen: false,
  isItemPopupOpen: false,
  currentItemIndex: null,
  myRank: null,
  message: "Let's get roasting!",
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case 'LOAD_STATE': {
      const savedState = action.payload;
      const loadedItems = state.items.map(item => {
        const savedItem = savedState.items.find((si: { name: string; }) => si.name === item.name);
        return savedItem ? { ...item, owned: savedItem.owned, customName: savedItem.customName } : item;
      });

      let baseClick = 1;
      let baseBps = 0;
      loadedItems.forEach(item => {
        if (item.type === 'click') baseClick += item.val * item.owned;
        else baseBps += item.val * item.owned;
      });

      return {
        ...state,
        ...savedState.gameState,
        items: loadedItems,
        baseClick,
        baseBps,
        isFirstLoad: false,
      };
    }
    case 'NEW_GAME': {
      return {
        ...state,
        isFirstLoad: true,
        playerId: generateUUID(),
        nextGoldenTime: Date.now() + GOLDEN_INTERVAL,
      }
    }
    case 'SET_PLAYER_NAME': {
        return { ...state, playerName: action.payload, isFirstLoad: false };
    }
    case 'GAME_TICK': {
      const now = Date.now();
      const delta = (now - state.lastTime) / 1000;

      const multiplier = state.isFever ? 5 : 1;
      const beansGained = state.baseBps * multiplier * delta;

      let newParticles = state.particles
        .map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.5, life: p.life - 0.03 }))
        .filter(p => p.life > 0);
      
      let newFloatingTexts = state.floatingTexts
        .map(ft => ({ ...ft, y: ft.y - 1, life: ft.life - 0.02 }))
        .filter(ft => ft.life > 0);

      let newFeverGauge = state.feverGauge;
      if (!state.isFever && state.feverGauge > 0) newFeverGauge = Math.max(0, state.feverGauge - 0.5 * delta * 20);
      if (state.isFever) newFeverGauge -= 0.5 * delta * 20;

      let newIsFever = state.isFever;
      if (state.isFever && newFeverGauge <= 0) {
        newIsFever = false;
        newFeverGauge = 0;
      }
      
      const score = Math.max(state.baseBps, state.baseClick, 1);
      const levelIndex = Math.min(Math.floor(Math.log10(score)), state.levels.length - 1);
      
      let newGoldenBean = { ...state.goldenBean };
      if(newGoldenBean.active) {
        newGoldenBean.x += newGoldenBean.vx;
        newGoldenBean.y += newGoldenBean.vy;
        if (newGoldenBean.x < 30 || newGoldenBean.x > 370) newGoldenBean.vx *= -1;
        if (newGoldenBean.y < 30 || newGoldenBean.y > 150) newGoldenBean.vy *= -1;
        newGoldenBean.life -= (1/6) * delta;
        if(newGoldenBean.life <= 0) {
            newGoldenBean.active = false;
            return {...state, goldenBean: newGoldenBean, nextGoldenTime: now + GOLDEN_INTERVAL};
        }
      } else if (now > state.nextGoldenTime) {
        newGoldenBean = {
            active: true, x: 50 + Math.random() * 300, y: 50 + Math.random() * 100,
            vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4, life: 6.0 
        };
      }

      return {
        ...state,
        beans: state.beans + beansGained,
        lastTime: now,
        particles: newParticles,
        floatingTexts: newFloatingTexts,
        feverGauge: newFeverGauge,
        isFever: newIsFever,
        levelIndex,
        goldenBean: newGoldenBean,
      };
    }
    case 'CANVAS_CLICK': {
      const { x, y } = action.payload;
      
      if (state.goldenBean.active) {
          const gb = state.goldenBean;
          const dist = Math.sqrt((x - gb.x)**2 + (y - gb.y)**2);
          if (dist < 60) {
              const newFloatingTexts = [...state.floatingTexts, { x, y, val: "LUCKY!", life: 2.0, color: "#ffd700" }];
              return { ...state, goldenBean: { ...gb, active: false }, isFever: true, feverGauge: 100, floatingTexts: newFloatingTexts, nextGoldenTime: Date.now() + GOLDEN_INTERVAL };
          }
      }

      const multiplier = state.isFever ? 5 : 1;
      const clickGain = state.baseClick * multiplier;

      let newFeverGauge = state.feverGauge;
      let newIsFever = state.isFever;
      if (!newIsFever) {
        newFeverGauge = Math.min(100, state.feverGauge + 2);
        if (newFeverGauge >= 100) newIsFever = true;
      }
      
      const newParticles = [...state.particles];
      for(let j=0; j<6; j++) { newParticles.push({x: x, y: y, vx:(Math.random()-0.5)*15, vy:(Math.random()-0.5)*15-5, life:1}); }

      const newFloatingTexts = [...state.floatingTexts, { x, y, val: clickGain, life: 1.0 }];

      return {
        ...state,
        beans: state.beans + clickGain,
        manualTotal: state.manualTotal + clickGain,
        clickScale: 0.9,
        feverGauge: newFeverGauge,
        isFever: newIsFever,
        particles: newParticles,
        floatingTexts: newFloatingTexts,
      };
    }
    case 'BUY_ITEM': {
      const itemIndex = action.payload;
      const item = state.items[itemIndex];
      if (!item) return state;

      const costMultiplier = item.type === 'bps' ? 1.18 : 1.6;
      const price = Math.floor(item.basePrice * Math.pow(costMultiplier, item.owned));

      if (state.beans < price) return state;

      const newItems = [...state.items];
      newItems[itemIndex] = { ...item, owned: item.owned + 1 };

      return {
        ...state,
        beans: state.beans - price,
        items: newItems,
        baseClick: item.type === 'click' ? state.baseClick + item.val : state.baseClick,
        baseBps: item.type === 'bps' ? state.baseBps + item.val : state.baseBps,
      };
    }
    case 'UPDATE_ITEM_NAME': {
        const { index, name } = action.payload;
        const newItems = [...state.items];
        newItems[index] = { ...newItems[index], customName: name };
        return { ...state, items: newItems };
    }
    case 'TOGGLE_ITEM_POPUP': {
      const isOpen = action.payload.isOpen;
      const itemIndex = action.payload.itemIndex;
      return {
        ...state,
        isItemPopupOpen: isOpen,
        currentItemIndex: itemIndex ?? null,
      }
    }
    case 'TOGGLE_RANKING_MODAL':
      return { ...state, isRankingModalOpen: action.payload };
    case 'UPDATE_MY_RANK':
      return { ...state, myRank: action.payload };
    case 'UPDATE_MESSAGE': {
        const { t } = action.payload;
        const messageTemplates = [
            t('message1', { name: state.playerName || t('barista') }),
            t('message2', { name: state.playerName || t('barista') }),
            t('message3', { name: state.playerName || t('barista') }),
            t('message4', { name: state.playerName || t('barista') }),
            t('message5', { name: state.playerName || t('barista') }),
            t('message6', { name: state.playerName || t('barista') }),
            t('message7', { name: state.playerName || t('barista') }),
            t('message8', { name: state.playerName || t('barista') }),
            t('message9', { name: state.playerName || t('barista') }),
        ];
        const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
        return { ...state, message: template };
    }
    case 'SAVE_GAME': // This is just for triggering the effect
      return state;
    case 'RESET_GAME': // This is just for triggering the effect
      return state;
    default:
      return state;
  }
};

export const GameContext = createContext<{ state: GameState; dispatch: React.Dispatch<GameAction> } | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const { toast } = useToast();
  const { t } = useI18n();
  const gameLoopRef = useRef<number>();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const rankTimeoutRef = useRef<NodeJS.Timeout>();
  const messageTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSave = useCallback((showToast: boolean) => {
    const { items, ...gameState } = state;
    const saveData = {
      gameState,
      items: items.map(item => ({ name: item.name, owned: item.owned, customName: item.customName })),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    if (state.playerId && state.playerName) {
      const score = state.baseBps * (state.isFever ? 5 : 1);
      saveToFirebase(state.playerId, state.playerName, score);
    }
    if (showToast) {
      toast({ title: t('game_saved_title'), description: t('game_saved_desc') });
    }
  }, [state, toast, t]);

  const handleReset = useCallback(() => {
    if (window.confirm(t('reset_confirm'))) {
      localStorage.removeItem(SAVE_KEY);
      window.location.reload();
    }
  }, [t]);

  const enhancedDispatch = useCallback((action: GameAction) => {
    if (action.type === 'SAVE_GAME') {
      handleSave(action.payload.showToast);
    } else if (action.type === 'RESET_GAME') {
      handleReset();
    } else {
      dispatch(action);
    }
  }, [handleSave, handleReset]);

  // Game Loop
  useEffect(() => {
    const loop = () => {
      dispatch({ type: 'GAME_TICK' });
      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);
    return () => {
      if(gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    }
  }, []);

  // Load Logic
  useEffect(() => {
    initFirebase();
    try {
      const savedData = localStorage.getItem(SAVE_KEY);
      if (savedData) {
        dispatch({ type: 'LOAD_STATE', payload: JSON.parse(savedData) });
      } else {
        dispatch({ type: 'NEW_GAME' });
      }
    } catch (error) {
      console.error("Failed to load game state:", error);
      dispatch({ type: 'NEW_GAME' });
    }
  }, []);
  
  // Periodic Save
  useEffect(() => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setInterval(() => handleSave(false), 30000);
      return () => { if(saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [handleSave]);

  // Periodic Rank Fetch
  useEffect(() => {
    const fetchAndUpdateRank = async () => {
        if(state.playerId) {
            const currentScore = state.baseBps * (state.isFever ? 5 : 1);
            const rank = await fetchMyRank(currentScore);
            dispatch({ type: 'UPDATE_MY_RANK', payload: rank });
        }
    };
    fetchAndUpdateRank();
    if(rankTimeoutRef.current) clearInterval(rankTimeoutRef.current);
    rankTimeoutRef.current = setInterval(fetchAndUpdateRank, 60000);
    return () => { if(rankTimeoutRef.current) clearTimeout(rankTimeoutRef.current); };
  }, [state.playerId, state.baseBps, state.isFever]);

  // Periodic Message Update
  useEffect(() => {
      if (state.goldenBean.active) return;
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
      messageTimeoutRef.current = setInterval(() => {
          if(!state.goldenBean.active) {
            dispatch({type: 'UPDATE_MESSAGE', payload: { t }});
          }
      }, 7000);
      return () => { if(messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current); };
  }, [state.playerName, state.goldenBean.active, t]);

  return (
    <GameContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </GameContext.Provider>
  );
};
