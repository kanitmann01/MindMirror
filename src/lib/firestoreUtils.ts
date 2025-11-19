import { doc, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, where, limit, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { OCEANScore, Archetype, MBTIResult, CognitiveStyle, Motivations } from './psychologyUtils';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  oceanScore?: OCEANScore;
  mbti?: MBTIResult;
  cognitiveStyle?: CognitiveStyle;
  motivations?: Motivations;
  archetype?: Archetype;
  onboardingCompleted: boolean;
  youtubeImported?: boolean; // Track if YouTube data has been imported
  createdAt: string;
}

export interface MediaItem {
  id?: string;
  title: string;
  category: 'book' | 'anime' | 'movie' | 'game' | 'youtube' | 'spotify';
  rating: number;
  mood: string[];
  intent: string[];
  createdAt: string;
}

export interface MoodEntry {
  id?: string;
  mood: string; // e.g. "Happy", "Anxious"
  intensity: number; // 1-10
  note: string;
  createdAt: string;
}

export const saveUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, data, { merge: true });
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
};

export const addMediaItem = async (userId: string, mediaItem: Omit<MediaItem, 'id'>) => {
  const mediaRef = collection(db, 'users', userId, 'media');
  await addDoc(mediaRef, mediaItem);
};

export const getMediaItems = async (userId: string): Promise<MediaItem[]> => {
  const mediaRef = collection(db, 'users', userId, 'media');
  const q = query(mediaRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem));
};

// Mood Tracking
export const addMoodEntry = async (userId: string, moodEntry: Omit<MoodEntry, 'id'>) => {
  const moodRef = collection(db, 'users', userId, 'moods');
  await addDoc(moodRef, moodEntry);
};

export const getMoodEntries = async (userId: string): Promise<MoodEntry[]> => {
  const moodRef = collection(db, 'users', userId, 'moods');
  const q = query(moodRef, orderBy('createdAt', 'desc'), limit(14)); // Last 2 weeks
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MoodEntry));
};

export const deleteUserData = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  
  // Delete subcollections (Media and Moods)
  // Note: Client-side deletion of subcollections requires querying them first.
  // This is not atomic, but sufficient for this prototype.
  
  const deleteCollection = async (collectionName: string) => {
    const colRef = collection(db, 'users', userId, collectionName);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  };

  await deleteCollection('media');
  await deleteCollection('moods');

  // Delete user profile document
  await deleteDoc(userRef);
};
