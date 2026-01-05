"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, limit, getCountFromServer, where, Firestore } from "firebase/firestore";

// IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD3mv9F87KSAJzuk0VYReg7aQfCQ7ak7ko", // This is a placeholder from the user's request
  authDomain: "career-brew.firebaseapp.com",
  projectId: "career-brew",
  storageBucket: "career-brew.appspot.com",
  messagingSenderId: "48722044572",
  appId: "1:48722044572:web:858470248dee6aab42ef59",
  measurementId: "G-5MLYRT46P4"
};

let app: FirebaseApp;
let db: Firestore;

export function initFirebase() {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      console.log("🔥 Firebase connected!");
    } catch (e) {
      console.error("⚠️ Firebase connection failed.", e);
    }
  }
}

export async function saveToFirebase(playerId: string, playerName: string, score: number) {
  if (!db || !playerId || !playerName) return;
  try {
    await setDoc(doc(db, "leaderboard", playerId), {
      name: playerName,
      score: score,
      timestamp: Date.now()
    });
  } catch (e) {
    console.error("🔥 Firestore save failed:", e);
  }
}

export type RankEntry = {
  id: string;
  name: string;
  score: number;
};

export async function fetchRealRanking(): Promise<RankEntry[]> {
  if (!db) return [];
  try {
    const q = query(collection(db, "leaderboard"), orderBy("score", "desc"), limit(50));
    const querySnapshot = await getDocs(q);
    const ranking: RankEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ranking.push({
        id: doc.id,
        name: data.name,
        score: data.score
      });
    });
    return ranking;
  } catch (e) {
    console.error("Ranking load failed:", e);
    return [];
  }
}

export async function fetchMyRank(myScore: number): Promise<number | null> {
    if (!db) return null;
    try {
        const coll = collection(db, "leaderboard");
        const q = query(coll, where("score", ">", myScore));
        const snapshot = await getCountFromServer(q);
        return snapshot.data().count + 1;
    } catch (e) {
        console.error("My rank load failed:", e);
        return null;
    }
}
