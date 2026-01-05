export interface Item {
  id: string;
  name: string;
  customName?: string;
  type: 'bps' | 'click';
  basePrice: number;
  val: number;
  owned: number;
  icon: string;
  description: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface FloatingText {
  x: number;
  y: number;
  val: number | string;
  life: number;
  color?: string;
}

export interface GoldenBean {
    active: boolean;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
}

export interface GameState {
  beans: number;
  baseBps: number;
  baseClick: number;
  manualTotal: number;
  items: Item[];
  feverGauge: number;
  isFever: boolean;
  lastTime: number;
  clickScale: number;
  playerName: string;
  defaultPlayerName: string;
  playerId: string;
  levels: string[];
  levelIndex: number;
  goldenBean: GoldenBean;
  nextGoldenTime: number;
  particles: Particle[];
  floatingTexts: FloatingText[];
  isFirstLoad: boolean;
  isRankingModalOpen: boolean;
  isStoreModalOpen: boolean;
  isItemPopupOpen: boolean;
  currentItemIndex: number | null;
  myRank: number | null;
  message: string;
  lastClickTime: number;
  showClickHint: boolean;
}

export type GameAction =
  | { type: 'LOAD_STATE'; payload: any }
  | { type: 'NEW_GAME', payload: { initialState: GameState } }
  | { type: 'SET_PLAYER_NAME'; payload: string }
  | { type: 'GAME_TICK' }
  | { type: 'CANVAS_CLICK'; payload: { x: number; y: number } }
  | { type: 'BUY_ITEM'; payload: number }
  | { type: 'UPDATE_ITEM_NAME'; payload: { index: number, name: string } }
  | { type: 'SAVE_GAME'; payload: { showToast: boolean } }
  | { type: 'RESET_GAME' }
  | { type: 'TOGGLE_ITEM_POPUP', payload: { isOpen: boolean, itemIndex?: number } }
  | { type: 'TOGGLE_RANKING_MODAL', payload: boolean }
  | { type: 'TOGGLE_STORE_MODAL', payload: boolean }
  | { type: 'UPDATE_MY_RANK', payload: number | null }
  | { type: 'UPDATE_MESSAGE', payload: { t: (key: string, options?: any) => string } }
  | { type: 'TOGGLE_CLICK_HINT', payload: boolean };
