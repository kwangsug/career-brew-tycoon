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
  db: Firestore,
  playerId: string,
  playerName: string,
  score: number
) {
  if (!db || !playerId || !playerName) return;
  try {
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

export async function fetchRealRanking(db: Firestore): Promise<RankEntry[]> {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'leaderboard'),
      orderBy('score', 'desc'),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
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
  } catch (e) {
    console.error('Ranking load failed:', e);
    return [];
  }
}

export async function fetchMyRank(
  db: Firestore,
  myScore: number
): Promise<number | null> {
  if (!db) return null;
  try {
    const coll = collection(db, 'leaderboard');
    const q = query(coll, where('score', '>', myScore));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count + 1;
  } catch (e) {
    console.error('My rank load failed:', e);
    return null;
  }
}
