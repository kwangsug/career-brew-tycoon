'use client';

import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  getCountFromServer,
  where,
  Firestore,
} from 'firebase/firestore';
import {
  setDocumentNonBlocking
} from '@/firebase/non-blocking-updates';

export async function saveToFirebase(
  db: Firestore | null,
  playerId: string,
  playerName: string,
  score: number
) {
  if (!db) {
    console.warn('🔥 Firestore not initialized');
    return;
  }
  if (!playerId || !playerName) {
    console.warn('🔥 Missing playerId or playerName');
    return;
  }
  try {
    console.log('🔥 Saving to Firestore:', { playerId, playerName, score });
    const leaderboardRef = doc(db, 'leaderboard', playerId);
    setDocumentNonBlocking(leaderboardRef, {
      name: playerName,
      score: score,
      timestamp: Date.now(),
    }, { merge: true });
  } catch (e) {
    console.error('🔥 Firestore save failed:', e);
  }
}

export type RankEntry = {
  id: string;
  name: string;
  score: number;
};

export async function fetchRealRanking(db: Firestore | null): Promise<RankEntry[]> {
  if (!db) {
    console.warn('🔥 fetchRealRanking: Firestore not initialized');
    return [];
  }
  try {
    console.log('🔥 Fetching ranking from Firestore...');
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    console.log('🔥 Ranking fetched, count:', querySnapshot.size);
    const ranking: RankEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ranking.push({
        id: doc.id,
        name: data.name,
        score: data.score,
      });
    });
    return ranking;
  } catch (e: any) {
    console.error('🔥 Ranking load failed:', e?.code, e?.message, e);
    return [];
  }
}

export async function fetchMyRank(
  db: Firestore | null,
  myScore: number
): Promise<number | null> {
  if (!db) {
    console.warn('🔥 fetchMyRank: Firestore not initialized');
    return null;
  }
  try {
    const coll = collection(db, 'leaderboard');
    const q = query(coll, where('score', '>', myScore));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count + 1;
  } catch (e: any) {
    console.error('🔥 My rank load failed:', e?.code, e?.message, e);
    return null;
  }
}
