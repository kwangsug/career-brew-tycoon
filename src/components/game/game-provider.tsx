"use client";

import React, { createContext, useReducer, useEffect, ReactNode, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { GameState, GameAction, Item } from '@/types/game';
import { initialItems, levels as levelNames } from '@/lib/game-data';
import { saveToFirebase, fetchMyRank } from '@/lib/firebase-service';
import { useI18n } from '@/locales/client';
import { useAuth, useFirestore, useUser, initiateAnonymousSignIn } from '@/firebase';
import type { User } from 'firebase/auth';

const SAVE_KEY = 'careerBrewSaveV1.0';
const GOLDEN_INTERVAL = 10 * 60 * 1000; // 10 minutes
const CLICK_HINT_IDLE_TIME = 4000; // 4 seconds

const generateUUID = () => 'user-' + Math.random().toString(36).substring(2, 9);

const getInitialState = (t: (key: string, options?: any) => string): GameState => {
  const adjectives = t('random_adjectives', { returnObjects: true }) as string[];
  const nouns = t('random_nouns', { returnObjects: true }) as string[];
  const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
  
  return {
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
    isStoreModalOpen: false,
    isItemPopupOpen: false,
    currentItemIndex: null,
    myRank: null,
    message: "Let's get roasting!",
    lastClickTime: Date.now(),
    showClickHint: false,
    canAffordNewItem: false,
    notifiedAffordableItems: [],
    newlyAffordableItem: null,
  };
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
        lastClickTime: Date.now(),
      };
    }
    case 'NEW_GAME': {
      return {
        ...action.payload.initialState,
        isFirstLoad: true,
        playerId: action.payload.user?.uid || generateUUID(),
        nextGoldenTime: Date.now() + GOLDEN_INTERVAL,
        lastClickTime: Date.now(),
      }
    }
    case 'SET_PLAYER_NAME': {
        return { ...state, playerName: action.payload, isFirstLoad: false };
    }
    case 'SET_DEFAULT_PLAYER_NAME': {
        if (state.playerName) return state; // Don't override if name is already set
        return { ...state, defaultPlayerName: action.payload };
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

      const showHint = now - state.lastClickTime > CLICK_HINT_IDLE_TIME;

      const newBeans = state.beans + beansGained;

      // Find affordable items
      const affordableItems = state.items.filter(item => {
        const costMultiplier = item.type === 'bps' ? 1.18 : 1.6;
        const price = Math.floor(item.basePrice * Math.pow(costMultiplier, item.owned));
        return newBeans >= price;
      });

      const canAfford = affordableItems.length > 0;

      // Detect newly affordable item (not yet notified)
      const newlyAffordable = affordableItems.find(
        item => !state.notifiedAffordableItems.includes(item.id)
      );

      // Update notified list if new item found
      const updatedNotifiedItems = newlyAffordable
        ? [...state.notifiedAffordableItems, newlyAffordable.id]
        : state.notifiedAffordableItems;

      return {
        ...state,
        beans: newBeans,
        lastTime: now,
        particles: newParticles,
        floatingTexts: newFloatingTexts,
        feverGauge: newFeverGauge,
        isFever: newIsFever,
        levelIndex,
        goldenBean: newGoldenBean,
        showClickHint: showHint,
        canAffordNewItem: canAfford,
        notifiedAffordableItems: updatedNotifiedItems,
        newlyAffordableItem: newlyAffordable || null,
      };
    }
    case 'CANVAS_CLICK': {
      const { x, y } = action.payload;
      
      if (state.goldenBean.active) {
          const gb = state.goldenBean;
          const dist = Math.sqrt((x - gb.x)**2 + (y - gb.y)**2);
          if (dist < 60) {
              const newFloatingTexts = [...state.floatingTexts, { x, y, val: "LUCKY!", life: 2.0, color: "#ffd700", rotation: (Math.random() - 0.5) * 30 }];
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

      const newFloatingTexts = [...state.floatingTexts, { x, y, val: clickGain, life: 1.0, rotation: (Math.random() - 0.5) * 60 }];

      return {
        ...state,
        beans: state.beans + clickGain,
        manualTotal: state.manualTotal + clickGain,
        clickScale: 0.9,
        feverGauge: newFeverGauge,
        isFever: newIsFever,
        particles: newParticles,
        floatingTexts: newFloatingTexts,
        lastClickTime: Date.now(),
        showClickHint: false,
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

      const isFromStore = state.isStoreModalOpen;
      const isFromPopup = state.isItemPopupOpen;

      return {
        ...state,
        beans: state.beans - price,
        items: newItems,
        baseClick: item.type === 'click' ? state.baseClick + item.val : state.baseClick,
        baseBps: item.type === 'bps' ? state.baseBps + item.val : state.baseBps,
        isStoreModalOpen: isFromStore ? false : state.isStoreModalOpen,
        isItemPopupOpen: isFromPopup ? false : state.isItemPopupOpen,
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
    case 'TOGGLE_STORE_MODAL':
      return { ...state, isStoreModalOpen: action.payload };
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
    case 'TOGGLE_CLICK_HINT': {
      return { ...state, showClickHint: action.payload };
    }
    case 'CLEAR_NEW_ITEM_NOTIFICATION': {
      return { ...state, newlyAffordableItem: null };
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

const GameProviderContent = ({ children }: { children: ReactNode }) => {
  const { t, i18n } = useI18n();
  const [state, dispatch] = useReducer(gameReducer, getInitialState(t));
  const { toast } = useToast();
  const firestore = useFirestore();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  
  const gameLoopRef = useRef<number>();
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const rankTimeoutRef = useRef<NodeJS.Timeout>();
  const messageTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoad = useRef(true);

  const handleSave = useCallback((showToast: boolean) => {
    const { items, ...gameState } = state;
    const saveData = {
      gameState,
      items: items.map(item => ({ name: item.name, owned: item.owned, customName: item.customName })),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    if (state.playerId && state.playerName) {
      const score = state.baseBps * (state.isFever ? 5 : 1);
      saveToFirebase(firestore, state.playerId, state.playerName, score);
    }
    if (showToast) {
      toast({ title: t('game_saved_title'), description: t('game_saved_desc') });
    }
  }, [state, toast, t, firestore]);

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
  
  // Auth & Load Logic
  useEffect(() => {
    if (isUserLoading || !isInitialLoad.current) {
        return; // Wait until auth state is resolved or if initial load is already done
    }

    const loadGame = async (currentUser: User | null) => {
        let finalUser = currentUser;

        if (!finalUser) {
            try {
                // 1. 익명 로그인을 먼저 시도하고, 완료될 때까지 기다립니다.
                const userCredential = await initiateAnonymousSignIn(auth);
                finalUser = userCredential.user;
            } catch (error) {
                console.error("Anonymous sign in failed:", error);
                // 로그인 실패 시에도 앱이 멈추지 않고 새 게임을 시작합니다.
                dispatch({ type: 'NEW_GAME', payload: { initialState: getInitialState(t), user: null } });
                isInitialLoad.current = false;
                return;
            }
        }

        isInitialLoad.current = false; // Mark initial load as complete

        // 2. 로그인이 보장된 후에야 로컬 데이터를 불러옵니다.
        try {
            const savedData = localStorage.getItem(SAVE_KEY);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // playerId를 현재 사용자로 업데이트하고 로드
                parsedData.gameState.playerId = finalUser.uid;
                dispatch({ type: 'LOAD_STATE', payload: parsedData });
            } else {
                // 저장된 데이터가 없으면 새 게임을 시작합니다.
                dispatch({ type: 'NEW_GAME', payload: { initialState: getInitialState(t), user: finalUser } });
            }
        } catch (error) {
            console.error("Failed to load or parse game state. Starting new game.", error);
            dispatch({ type: 'NEW_GAME', payload: { initialState: getInitialState(t), user: finalUser } });
        }
    };

    // 3. Firebase의 초기 인증 상태 확인이 끝나면 loadGame 함수를 실행합니다.
    if (!isUserLoading) {
      loadGame(user);
    }

  }, [user, isUserLoading, auth, t]);


  // Update default name when language changes
  useEffect(() => {
    if (state.isFirstLoad) {
        const adjectives = t('random_adjectives', { returnObjects: true }) as string[];
        const nouns = t('random_nouns', { returnObjects: true }) as string[];
        const randomName = `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
        dispatch({ type: 'SET_DEFAULT_PLAYER_NAME', payload: randomName });
    }
  }, [t, i18n.language, state.isFirstLoad]);
  
  // Periodic Save
  useEffect(() => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setInterval(() => handleSave(false), 30000);
      return () => { if(saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [handleSave]);

  // Periodic Rank Fetch
  useEffect(() => {
    const fetchAndUpdateRank = async () => {
        if(state.playerId && firestore) {
            const currentScore = state.baseBps * (state.isFever ? 5 : 1);
            const rank = await fetchMyRank(firestore, currentScore);
            dispatch({ type: 'UPDATE_MY_RANK', payload: rank });
        }
    };
    fetchAndUpdateRank();
    if(rankTimeoutRef.current) clearInterval(rankTimeoutRef.current);
    rankTimeoutRef.current = setInterval(fetchAndUpdateRank, 60000);
    return () => { if(rankTimeoutRef.current) clearTimeout(rankTimeoutRef.current); };
  }, [state.playerId, state.baseBps, state.isFever, firestore]);

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

  // New Item Notification
  useEffect(() => {
    if (state.newlyAffordableItem && !state.isFirstLoad) {
      const itemName = t(state.newlyAffordableItem.id) || state.newlyAffordableItem.name;
      toast({
        title: t('new_item_available'),
        description: t('new_item_available_desc', { item: itemName }),
        action: (
          <button
            onClick={() => dispatch({ type: 'TOGGLE_STORE_MODAL', payload: true })}
            className="px-3 py-1 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            {t('go_to_store')}
          </button>
        ),
      });
      dispatch({ type: 'CLEAR_NEW_ITEM_NOTIFICATION' });
    }
  }, [state.newlyAffordableItem, state.isFirstLoad, t, toast]);

  return (
    <GameContext.Provider value={{ state, dispatch: enhancedDispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const GameProvider = ({ children }: { children: ReactNode }) => (
  <GameProviderContent>{children}</GameProviderContent>
);
