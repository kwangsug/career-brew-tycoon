"use client";

import { useContext } from 'react';
import { GameContext } from './game-provider';
import { formatNum } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/locales/client';

const StatRow = ({ label, value, badgeClass }: { label: string, value: string, badgeClass: string }) => (
  <div className="flex flex-col justify-center items-center font-bold text-sm">
    <span>{label}</span>
    <Badge className={`text-base min-w-[70px] justify-center mt-1 ${badgeClass}`}>{value}</Badge>
  </div>
);

export default function StatsPanel() {
  const { state, dispatch } = useContext(GameContext);
  const { t } = useI18n();

  if (!state) return null;

  const { beans, baseBps, baseClick, isFever, manualTotal, levels, levelIndex, myRank, nextGoldenTime, goldenBean, message } = state;
  
  const levelNames = t('levels', { returnObjects: true }) as string[];

  const multiplier = isFever ? 5 : 1;
  const currentBps = baseBps * multiplier;
  const currentClick = baseClick * multiplier;

  const getTimeLeft = () => {
    const timeLeft = nextGoldenTime - Date.now();
    if (timeLeft <= 0) return `✨ ${t('golden_bean_ready')} ✨`;
    const m = Math.floor(timeLeft / 60000);
    const s = Math.floor((timeLeft % 60000) / 1000);
    return `⏳ ${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="flex-shrink-0 bg-card/70 backdrop-blur-sm">
      <CardContent className="p-3 text-center space-y-2">
        <div className="border-b border-dashed pb-2 mb-2">
          <span className="font-bold">{state.playerName}</span>, {t('rank')}: <span className="text-primary font-black text-lg">{levelNames[levelIndex]}</span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Badge 
            variant="outline"
            className="cursor-pointer border-2 border-amber-400 text-amber-600 font-bold hover:bg-amber-100/50"
            onClick={() => dispatch({ type: 'TOGGLE_RANKING_MODAL', payload: true })}
          >
            🏆 {myRank ? `${t('global_rank')}: ${formatNum(myRank)}` : t('connecting')}
          </Badge>
          <Badge variant={goldenBean.active || nextGoldenTime - Date.now() <= 0 ? "destructive" : "secondary"} className={`transition-all ${goldenBean.active ? 'animate-pulse' : ''}`}>
            {getTimeLeft()}
          </Badge>
        </div>
        
        <div className="font-black text-4xl text-shadow">
          {formatNum(beans)} 🫘
        </div>
        <div className="text-xs font-bold opacity-70 -mt-2">
          {t('manual_roast')}: {formatNum(manualTotal)}
        </div>

        <div className="flex justify-center gap-4 pt-2 border-t border-dashed">
          <StatRow label={`👆 ${t('per_click')}`} value={formatNum(currentClick)} badgeClass="bg-[#ffe0b2] text-[#e65100] border-[#ffb74d] hover:bg-[#ffe0b2]/80" />
          <StatRow label={`⚙️ ${t('per_second')}`} value={formatNum(currentBps)} badgeClass="bg-[#e0f2f1] text-[#00695c] border-[#4db6ac] hover:bg-[#e0f2f1]/80" />
        </div>
        
        <div className={`text-sm font-bold h-5 transition-all duration-500 ${goldenBean.active ? 'gold-alert' : 'opacity-80'}`}>
          {goldenBean.active ? `✨ ${t('golden_bean_appeared')} ✨` : message}
        </div>
      </CardContent>
    </Card>
  );
}
