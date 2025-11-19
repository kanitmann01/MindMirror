import { doc, setDoc, getDoc, collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { OCEANScore, Archetype, MBTIResult, CognitiveStyle, Motivations } from './psychologyUtils';

/**
 * Represents the comprehensive user profile stored in Firestore.
 */
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
  createdAt: string;
  youtubeImported?: boolean;
}

/**
 * Represents a single media item (book, movie, etc.) added by the user.
 */
export interface MediaItem {
  id?: string;
  title: string;
  category: 'book' | 'anime' | 'movie' | 'game' | 'youtube' | 'spotify';
  rating: number;
  mood: string[];
  intent: string[];
  createdAt: string;
}

/**
 * Represents a daily mood entry.
 */
export interface MoodEntry {
  id?: string;
  mood: string; // e.g. "Happy", "Anxious"
  intensity: number; // 1-10
  note: string;
  createdAt: string;
}

/**
 * Saves or updates a user's profile data in Firestore.
 * @param userId - The Firebase Auth UID
 * @param data - Partial profile data to merge
 */
export const saveUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, data, { merge: true });
};

/**
 * Retrieves the user profile from Firestore.
 * @param userId - The Firebase Auth UID
 * @returns The UserProfile or null if not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, 'users', userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
};

/**
 * Adds a new media item to the user's 'media' subcollection.
 * @param userId - The Firebase Auth UID
 * @param mediaItem - The media item data (excluding ID)
 */
export const addMediaItem = async (userId: string, mediaItem: Omit<MediaItem, 'id'>) => {
  const mediaRef = collection(db, 'users', userId, 'media');
  await addDoc(mediaRef, mediaItem);
};

/**
 * Fetches all media items for a user, ordered by creation date (descending).
 * @param userId - The Firebase Auth UID
 * @returns Array of MediaItem
 */
export const getMediaItems = async (userId: string): Promise<MediaItem[]> => {
  const mediaRef = collection(db, 'users', userId, 'media');
  const q = query(mediaRef, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MediaItem));
};

/**
 * Adds a mood entry to the user's 'moods' subcollection.
 * @param userId - The Firebase Auth UID
 * @param moodEntry - The mood data
 */
export const addMoodEntry = async (userId: string, moodEntry: Omit<MoodEntry, 'id'>) => {
  const moodRef = collection(db, 'users', userId, 'moods');
  await addDoc(moodRef, moodEntry);
};

/**
 * Fetches the last 14 mood entries for a user.
 * @param userId - The Firebase Auth UID
 * @returns Array of MoodEntry
 */
export const getMoodEntries = async (userId: string): Promise<MoodEntry[]> => {
  const moodRef = collection(db, 'users', userId, 'moods');
  const q = query(moodRef, orderBy('createdAt', 'desc'), limit(14)); // Last 2 weeks
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as MoodEntry));
};

/**
 * Permanently deletes all user data (profile, media, moods).
 * This is a destructive action and should be confirmed by the user.
 * @param userId - The Firebase Auth UID
 */
export const deleteUserData = async (userId: string) => {
  const userRef = doc(db, 'users', userId);

  // Helper to delete a subcollection
  const deleteCollection = async (collectionName: string) => {
    const colRef = collection(db, 'users', userId, collectionName);
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
        });
        await batch.commit();
    }
  };

  // Delete subcollections first
  await deleteCollection('media');
  await deleteCollection('moods');

  // Delete user profile document
  await deleteDoc(userRef);
};
