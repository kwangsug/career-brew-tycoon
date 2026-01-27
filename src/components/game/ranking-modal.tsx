"use client";

import { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameContext } from './game-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchRealRanking, fetchMyRank, type RankEntry } from '@/lib/firebase-service';
import { formatNum } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Crown } from 'lucide-react';
import { useI18n } from '@/locales/client';
import { useFirestore } from '@/firebase';

type TabName = 'national' | 'regional' | 'friend';

const RankItem = ({ rank, entry, isMe, youText, lang, perSecondText }: { rank: number, entry: RankEntry, isMe: boolean, youText: string, lang: string, perSecondText: string }) => {
  const rankBadge = () => {
    if (rank === 1) return <span className="text-yellow-400"><Crown className="w-5 h-5" /></span>;
    if (rank === 2) return <span className="text-gray-400"><Crown className="w-5 h-5" /></span>;
    if (rank === 3) return <span className="text-amber-700"><Crown className="w-5 h-5" /></span>;
    return <span className="w-5 text-center">{rank}</span>
  };

  const displayName = isMe ? `${entry.name} ${youText}` : entry.name;
  const scoreDisplay = lang === 'ko'
    ? `${perSecondText} ${formatNum(entry.score, lang)}`
    : `${formatNum(entry.score, lang)} BPS`;

  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${isMe ? 'bg-primary/20 border-2 border-primary' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="font-bold text-lg w-5 text-center">{rankBadge()}</div>
        <div className={`font-bold ${isMe ? 'text-primary' : ''}`}>{displayName}</div>
      </div>
      <div className="font-mono font-bold">{scoreDisplay}</div>
    </div>
  );
};

export default function RankingModal() {
    const { state, dispatch } = useContext(GameContext);
  const [activeTab, setActiveTab] = useState<TabName>('national');
  const [nationalRanking, setNationalRanking] = useState<RankEntry[]>([]);
  const [virtualRankings, setVirtualRankings] = useState<{ regional: RankEntry[], friend: RankEntry[] }>({ regional: [], friend: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [myRank, setMyRank] = useState<number | null>(null);
  const { t, i18n } = useI18n();
  const firestore = useFirestore();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Use refs to avoid recreating callback on every state change
  const stateRef = useRef(state);
  stateRef.current = state;

  const loadNationalRanking = useCallback(async (showLoading = true) => {
    const currentState = stateRef.current;
    if (!firestore || !currentState) {
      return;
    }
    if (showLoading) setIsLoading(true);
    const ranks = await fetchRealRanking(firestore);
    setNationalRanking(ranks);

    // Check if I'm in the top 50 - prioritize playerId match, then name match
    const myName = currentState.playerName || currentState.defaultPlayerName;
    const myEntryById = ranks.find(r => r.id === currentState.playerId);
    const myEntryByName = !myEntryById ? ranks.find(r => r.name === myName) : null;
    const amInList = !!(myEntryById || myEntryByName);

    if (!amInList) {
      const currentScore = currentState.baseBps * (currentState.isFever ? 5 : 1);
      const rank = await fetchMyRank(firestore, currentScore);
      setMyRank(rank);
    } else {
      setMyRank(null);
    }

    if (showLoading) setIsLoading(false);
  }, [firestore]);

  // Polling for real-time ranking updates (every 10 seconds)
  useEffect(() => {
    if (state?.isRankingModalOpen && activeTab === 'national') {
      // Save current score before loading ranking
      dispatch?.({ type: 'SAVE_GAME', payload: { showToast: false } });
      // Small delay to allow save to complete, then load ranking
      setTimeout(() => loadNationalRanking(true), 500);
      pollingRef.current = setInterval(() => {
        loadNationalRanking(false); // Don't show loading skeleton on refresh
      }, 10000);
    }
    if (state?.isRankingModalOpen && (activeTab === 'regional' || activeTab === 'friend')) {
      generateVirtualRanking(activeTab);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.isRankingModalOpen, activeTab]);
  
  const generateVirtualRanking = (type: 'regional' | 'friend') => {
    if (!state) return;
    const npcNames = {
        regional: t('regional_npcs', { returnObjects: true }) as string[],
        friend: t('friend_npcs', { returnObjects: true }) as string[]
    };
    const currentScore = state.baseBps * (state.isFever ? 5 : 1);
    const myName = state.playerName || state.defaultPlayerName;
    let rankData: RankEntry[] = [];
    npcNames[type].forEach((name, i) => {
        let multiplier = (type === 'regional') ? Math.pow(10, (Math.random() * 4) - 2) : Math.random() * 2 + 0.1;
        let score = currentScore * multiplier + (i * 10);
        if (score < 10) score = Math.random() * 100;
        rankData.push({ id: `npc-${i}`, name: name, score: score });
    });
    rankData.push({ id: state.playerId, name: myName, score: currentScore });
    rankData.sort((a, b) => b.score - a.score);
    setVirtualRankings(prev => ({ ...prev, [type]: rankData }));
  };


  const handleClose = () => {
    if (dispatch) {
      dispatch({ type: 'TOGGLE_RANKING_MODAL', payload: false });
    }
  };
  
  const renderRankingList = (data: RankEntry[], showMyRankIfNotInList = false) => {
    // Only show skeleton on first load when there's no data yet
    if (isLoading && data.length === 0) {
      return Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-2">
          <div className="flex items-center gap-3">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="w-32 h-5" />
          </div>
          <Skeleton className="w-24 h-5" />
        </div>
      ));
    }

    // Use defaultPlayerName as fallback since playerName might be empty
    const myName = state?.playerName || state?.defaultPlayerName || '';
    const myPlayerId = state?.playerId || '';

    // Find my entry - prioritize playerId match, then name match (first one only)
    const myEntryById = data.find(r => r.id === myPlayerId);
    const myEntryByName = !myEntryById ? data.find(r => r.name === myName) : null;
    const myEntry = myEntryById || myEntryByName;
    const amInList = !!myEntry;
    const currentScore = state ? state.baseBps * (state.isFever ? 5 : 1) : 0;

    // Helper to check if an entry is "me" - only ONE entry should be marked
    const isMyEntry = (entry: RankEntry) => {
      if (myEntryById) return entry.id === myPlayerId;
      if (myEntryByName) return entry.id === myEntryByName.id;
      return false;
    };

    // Always show my entry if showMyRankIfNotInList is true
    const showMyEntry = showMyRankIfNotInList && !amInList && state;

    if (data.length === 0 && !showMyEntry) {
      return <div className="text-center p-8 text-muted-foreground">{t('no_ranking_data')}</div>;
    }

    return (
      <>
        {data.map((entry, index) => (
          <RankItem key={entry.id} rank={index + 1} entry={entry} isMe={isMyEntry(entry)} youText={t('you_text')} lang={i18n.language} perSecondText={t('per_second')} />
        ))}
        {showMyEntry && (
          <>
            {data.length > 0 && (
              <div className="flex items-center justify-center py-2 text-muted-foreground">
                <span className="text-sm">• • •</span>
              </div>
            )}
            <RankItem
              rank={myRank || 1}
              entry={{ id: state.playerId, name: myName, score: currentScore }}
              isMe={true}
              youText={t('you_text')}
              lang={i18n.language}
              perSecondText={t('per_second')}
            />
          </>
        )}
      </>
    );
  };


  return (
    <Dialog open={state?.isRankingModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-center">🏆 {t('realtime_rankings')}</DialogTitle>
          <DialogDescription className="sr-only">{t('realtime_rankings')}</DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabName)} className="flex flex-col flex-grow min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="national">🌏 {t('global_tab')}</TabsTrigger>
            <TabsTrigger value="regional">🏘️ {t('regional_tab')}</TabsTrigger>
            <TabsTrigger value="friend">👥 {t('friends_tab')}</TabsTrigger>
          </TabsList>
          <div className="flex-grow overflow-y-auto mt-2 pr-2">
            <TabsContent value="national" className="space-y-1">
              {renderRankingList(nationalRanking, true)}
            </TabsContent>
            <TabsContent value="regional" className="space-y-1">
              {renderRankingList(virtualRankings.regional)}
            </TabsContent>
            <TabsContent value="friend" className="space-y-1">
              {renderRankingList(virtualRankings.friend)}
            </TabsContent>
          </div>
        </Tabs>
        <DialogFooter>
          <Button onClick={handleClose} className="w-full">{t('close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
