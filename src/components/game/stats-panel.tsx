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
  const context = useContext(GameContext);
  const { t, i18n } = useI18n();
  if (!context) return null;
  const { state, dispatch } = context;

  const { beans, baseBps, baseClick, isFever, manualTotal, levels, levelIndex, myRank, nextGoldenTime, goldenBean, message } = state;

  // t('levels')가 string[]이 아닐 경우를 대비해 타입 단언 보강
  const levelNames = t('levels', { returnObjects: true }) as unknown as string[];

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
            🏆 {myRank ? `${t('global_rank')}: ${formatNum(myRank, i18n.language)}` : t('connecting')}
          </Badge>
          <Badge variant={goldenBean.active || nextGoldenTime - Date.now() <= 0 ? "destructive" : "secondary"} className={`transition-all ${goldenBean.active ? 'animate-pulse' : ''}`}>
            {getTimeLeft()}
          </Badge>
        </div>
        
        <div className="font-black text-4xl text-shadow">
          {formatNum(beans, i18n.language)} 🫘
        </div>
        <div className="text-xs font-bold opacity-70 -mt-2">
          {t('manual_roast')}: {formatNum(manualTotal, i18n.language)}
        </div>

        {/* 클릭당 00 | 초당 00 가로 배치, 숫자는 Badge로 감싸기 */}
        <div className="flex justify-center gap-2 pt-2 border-t border-dashed text-base font-bold">
          <span className="flex items-center gap-1">
            👆 {t('per_click')}
            <Badge className="bg-[#ffe0b2] text-[#e65100] border-[#ffb74d] hover:bg-[#ffe0b2]/80 text-base min-w-[48px] justify-center rounded-full px-3 py-1">
              {formatNum(currentClick, i18n.language)}
            </Badge>
          </span>
          <span className="mx-2">|</span>
          <span className="flex items-center gap-1">
            ⚙️ {t('per_second')}
            <Badge className="bg-[#e0f2f1] text-[#00695c] border-[#4db6ac] hover:bg-[#e0f2f1]/80 text-base min-w-[48px] justify-center rounded-full px-3 py-1">
              {formatNum(currentBps, i18n.language)}
            </Badge>
          </span>
        </div>
        
        <div className={`text-sm font-bold h-5 transition-all duration-500 ${goldenBean.active ? 'gold-alert' : 'opacity-80'}`}>
          {goldenBean.active ? `✨ ${t('golden_bean_appeared')} ✨` : message}
        </div>
      </CardContent>
    </Card>
  );
}
