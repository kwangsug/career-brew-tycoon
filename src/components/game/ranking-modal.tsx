"use client";

import { useContext, useState, useEffect } from 'react';
import { GameContext } from './game-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchRealRanking, type RankEntry } from '@/lib/firebase';
import { formatNum } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Crown, Loader2 } from 'lucide-react';

type TabName = 'national' | 'regional' | 'friend';

const RankItem = ({ rank, entry, isMe }: { rank: number, entry: RankEntry, isMe: boolean }) => {
  const rankBadge = () => {
    if (rank === 1) return <span className="text-yellow-400"><Crown className="w-5 h-5" /></span>;
    if (rank === 2) return <span className="text-gray-400"><Crown className="w-5 h-5" /></span>;
    if (rank === 3) return <span className="text-amber-700"><Crown className="w-5 h-5" /></span>;
    return <span className="w-5 text-center">{rank}</span>
  };

  return (
    <div className={`flex items-center justify-between p-2 rounded-lg ${isMe ? 'bg-primary/10' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="font-bold text-lg w-5 text-center">{rankBadge()}</div>
        <div className={`font-bold ${isMe ? 'text-primary' : ''}`}>{entry.name}</div>
      </div>
      <div className="font-mono font-bold">{formatNum(entry.score)} BPS</div>
    </div>
  );
};

export default function RankingModal() {
  const { state, dispatch } = useContext(GameContext);
  const [activeTab, setActiveTab] = useState<TabName>('national');
  const [nationalRanking, setNationalRanking] = useState<RankEntry[]>([]);
  const [virtualRankings, setVirtualRankings] = useState<{ regional: RankEntry[], friend: RankEntry[] }>({ regional: [], friend: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (state?.isRankingModalOpen && activeTab === 'national') {
      loadNationalRanking();
    }
    if (state?.isRankingModalOpen && (activeTab === 'regional' || activeTab === 'friend')) {
      generateVirtualRanking(activeTab);
    }
  }, [state?.isRankingModalOpen, activeTab]);

  const loadNationalRanking = async () => {
    setIsLoading(true);
    const ranks = await fetchRealRanking();
    setNationalRanking(ranks);
    setIsLoading(false);
  };
  
  const generateVirtualRanking = (type: 'regional' | 'friend') => {
    if (!state) return;
    const npcNames = {
        regional: ["Gangnam Landlord", "Pangyo Coder", "Yeoksam Artisan", "Hongdae Hipster", "Local Starbucks", "Next-door Ediya", "Upstairs Neighbor", "Town Unemployed", "Convenience King", "Han River Ramen Lover"],
        friend: ["Kim Coding", "Lee Java", "Park Python", "Choi Server", "Jung Client", "Han Designer", "Oh Planner", "Yoo CEO", "Jo Intern", "Hwang Manager"]
    };
    const currentScore = state.baseBps * (state.isFever ? 5 : 1);
    let rankData: RankEntry[] = [];
    npcNames[type].forEach((name, i) => {
        let multiplier = (type === 'regional') ? Math.pow(10, (Math.random() * 4) - 2) : Math.random() * 2 + 0.1;
        let score = currentScore * multiplier + (i * 10);
        if (score < 10) score = Math.random() * 100;
        rankData.push({ id: `npc-${i}`, name: name, score: score });
    });
    rankData.push({ id: state.playerId, name: `${state.playerName} (You)`, score: currentScore });
    rankData.sort((a, b) => b.score - a.score);
    setVirtualRankings(prev => ({ ...prev, [type]: rankData }));
  };


  const handleClose = () => {
    dispatch({ type: 'TOGGLE_RANKING_MODAL', payload: false });
  };
  
  const renderRankingList = (data: RankEntry[]) => {
    if (isLoading) {
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

    if (data.length === 0) {
      return <div className="text-center p-8 text-muted-foreground">No ranking data. Press "Save" to join!</div>;
    }

    return data.map((entry, index) => (
      <RankItem key={entry.id} rank={index + 1} entry={entry} isMe={entry.id === state?.playerId} />
    ));
  };


  return (
    <Dialog open={state?.isRankingModalOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-center">🏆 Real-time Rankings</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabName)} className="flex flex-col flex-grow min-h-0">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="national">🌏 Global</TabsTrigger>
            <TabsTrigger value="regional">🏘️ Regional</TabsTrigger>
            <TabsTrigger value="friend">👥 Friends</TabsTrigger>
          </TabsList>
          <div className="flex-grow overflow-y-auto mt-2 pr-2">
            <TabsContent value="national" className="space-y-1">
              {renderRankingList(nationalRanking)}
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
          <Button onClick={handleClose} className="w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
