import { doc, getDoc, setDoc, collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, where, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { OCEANScore, MBTIResult, CognitiveStyle, Motivations, Archetype } from './psychologyUtils';

/**
 * Calculates the new streak based on the last log date.
 * Copied here to avoid circular dependency with gamificationUtils.
 */
const calculateStreak = (currentStreak: number = 0, lastLogDate?: string): number => {
  if (!lastLogDate) return 1;

  const now = new Date();
  const last = new Date(lastLogDate);

  // Reset time part to compare dates only
  now.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  const diffTime = Math.abs(now.getTime() - last.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return Math.max(1, currentStreak);
  } else if (diffDays === 1) {
    return currentStreak + 1;
  } else {
    return 1;
  }
};

export interface PublicProfileConfig {
  username: string;
  isPublic: boolean;
  bio: string;
  avatar: string; // New: Avatar selection
  visibleSections: {
    ocean: boolean;
    mbti: boolean;
    archetype: boolean;
    mindmap: boolean;
    mood: boolean;
    achievements: boolean;
  }
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  oceanScore?: OCEANScore;
  archetype?: Archetype;
  mbti?: MBTIResult;
  cognitiveStyle?: CognitiveStyle;
  motivations?: Motivations;
  createdAt: string;
  youtubeImported?: boolean; // Flag to track if YouTube data has been imported
  goals?: string[]; // New: Array of user goals
  avatarSeed?: number; // New: Random seed for procedural avatar
  avatarTheme?: string; // New: Visual theme for avatar (e.g., 'neon', 'pastel')
  avatarShape?: 'triangle' | 'hexagon' | 'circle' | 'star'; // New: Explicit shape choice
  avatarComplexity?: 'low' | 'medium' | 'high'; // New: Visual complexity
  publicProfile?: PublicProfileConfig; // New: Public profile settings
  narrative_summary?: string; // New: AI Running Summary
  currentStreak?: number; // Gamification: Current daily streak
  lastLogDate?: string; // Gamification: Last date user logged something
  profile_precision?: 'low' | 'high'; // 'low' for Quick Calibration, 'high' for Deep Resonance
  aiInsights?: any; // FULL JSON response from Gemini for persistence
}

export interface MediaItem {
  id?: string;
  userId: string;
  title: string;
  category: string; // 'book', 'anime', 'movie', 'game', 'youtube', 'spotify'
  rating: number;
  tags: string[]; // User manually entered tags
  mood?: string[]; // Inferred or selected mood tags (e.g., 'uplifting', 'dark')
  intent?: string[]; // Inferred psychological intent (e.g., 'escapism', 'learning')
  createdAt: string;
}

export interface MoodEntry {
  id?: string;
  mood: string;
  intensity: number;
  note?: string;
  createdAt?: string;
}

export interface Feedback {
  userId: string;
  rating: number; // 1-5
  message: string;
  type: string; // 'bug', 'feature', 'general'
  createdAt: string;
}

/**
 * Saves or updates a user profile in Firestore.
 */
export const saveUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, data, { merge: true });
  } catch (error) {
    console.error("Error saving user profile:", error);
    throw error;
  }
};

/**
 * Retrieves a user profile from Firestore.
 */
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

/**
 * Adds a new media item to the user's 'media' subcollection.
 * Also updates the user's streak.
 */
export const addMediaItem = async (uid: string, item: MediaItem) => {
  try {
    const mediaRef = collection(db, 'users', uid, 'media');
    await addDoc(mediaRef, item);

    // Update Streak
    const profile = await getUserProfile(uid);
    if (profile) {
      const newStreak = calculateStreak(profile.currentStreak, profile.lastLogDate);
      await saveUserProfile(uid, {
        currentStreak: newStreak,
        lastLogDate: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error adding media item:", error);
    throw error;
  }
};

/**
 * Retrieves all media items for a user.
 */
export const getMediaItems = async (uid: string): Promise<MediaItem[]> => {
  try {
    const mediaRef = collection(db, 'users', uid, 'media');
    const q = query(mediaRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MediaItem));
  } catch (error) {
    console.error("Error getting media items:", error);
    throw error;
  }
};

/**
 * Deletes a specific media item from the user's 'media' subcollection.
 */
export const deleteMediaItem = async (uid: string, mediaId: string) => {
  try {
    const mediaDocRef = doc(db, 'users', uid, 'media', mediaId);
    await deleteDoc(mediaDocRef);
  } catch (error) {
    console.error("Error deleting media item:", error);
    throw error;
  }
};

/**
 * Adds a new mood entry to the user's 'moods' subcollection.
 * Also updates the user's streak.
 */
export const addMoodEntry = async (uid: string, entry: MoodEntry) => {
  try {
    const moodsRef = collection(db, 'users', uid, 'moods');
    await addDoc(moodsRef, entry);

    // Update Streak
    const profile = await getUserProfile(uid);
    if (profile) {
      const newStreak = calculateStreak(profile.currentStreak, profile.lastLogDate);
      await saveUserProfile(uid, {
        currentStreak: newStreak,
        lastLogDate: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error("Error adding mood entry:", error);
    throw error;
  }
};

/**
 * Retrieves recent mood entries for a user.
 */
export const getMoodEntries = async (uid: string, limitCount: number = 10): Promise<MoodEntry[]> => {
  try {
    const moodsRef = collection(db, 'users', uid, 'moods');
    const q = query(moodsRef, orderBy('createdAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MoodEntry));
  } catch (error) {
    console.error("Error getting mood entries:", error);
    throw error;
  }
};

/**
 * Deletes a specific mood entry from the user's 'moods' subcollection.
 */
export const deleteMoodEntry = async (uid: string, moodId: string) => {
  try {
    const moodDocRef = doc(db, 'users', uid, 'moods', moodId);
    await deleteDoc(moodDocRef);
  } catch (error) {
    console.error("Error deleting mood entry:", error);
    throw error;
  }
};

/**
 * Deletes all user data (profile and subcollections).
 */
export const deleteUserData = async (uid: string) => {
  try {
    // 1. Delete Media Subcollection
    const mediaRef = collection(db, 'users', uid, 'media');
    const mediaSnap = await getDocs(mediaRef);
    const mediaDeletePromises = mediaSnap.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(mediaDeletePromises);

    // 2. Delete Moods Subcollection
    const moodsRef = collection(db, 'users', uid, 'moods');
    const moodsSnap = await getDocs(moodsRef);
    const moodsDeletePromises = moodsSnap.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(moodsDeletePromises);

    // 3. Delete User Document
    const userRef = doc(db, 'users', uid);
    await deleteDoc(userRef);

  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
};

/**
 * Saves user feedback to a top-level 'feedback' collection.
 */
export const saveFeedback = async (feedback: Feedback) => {
  try {
    await addDoc(collection(db, 'feedback'), feedback);
  } catch (error) {
    console.error("Error saving feedback:", error);
    throw error;
  }
};

/**
 * Checks if a username is already taken.
 */
export const isUsernameTaken = async (username: string): Promise<boolean> => {
  const q = query(collection(db, 'usernames'), where('username', '==', username.toLowerCase()));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

/**
 * Claims a username for a user.
 * Uses a transaction to ensure uniqueness.
 */
export const claimUsername = async (uid: string, username: string): Promise<boolean> => {
  const usernameRef = doc(db, 'usernames', username.toLowerCase());

  try {
    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(usernameRef);
      if (docSnap.exists()) {
        if (docSnap.data().uid === uid) {
          // Already owned by this user, all good
          return;
        }
        throw new Error("Username taken");
      }
      transaction.set(usernameRef, { uid, username: username.toLowerCase(), claimedAt: new Date().toISOString() });
    });
    return true;
  } catch (e) {
    console.error("Username claim failed:", e);
    return false;
  }
};

/**
 * Fetches a public profile by username.
 */
export const getPublicProfile = async (username: string): Promise<{ profile: UserProfile, media: MediaItem[], moods: MoodEntry[] } | null> => {
  try {
    // 1. Resolve username to UID
    const usernameRef = doc(db, 'usernames', username.toLowerCase());
    const usernameSnap = await getDoc(usernameRef);

    if (!usernameSnap.exists()) return null;
    const uid = usernameSnap.data().uid;

    // 2. Fetch User Profile
    const profile = await getUserProfile(uid);
    if (!profile || !profile.publicProfile || !profile.publicProfile.isPublic) return null;

    // 3. Fetch Data based on visibility settings
    let media: MediaItem[] = [];
    let moods: MoodEntry[] = [];

    if (profile.publicProfile.visibleSections.mindmap) {
      media = await getMediaItems(uid); // Need media for graph
    }

    if (profile.publicProfile.visibleSections.mood) {
      moods = await getMoodEntries(uid, 5); // Recent moods
    }

    return { profile, media, moods };

  } catch (error) {
    console.error("Error fetching public profile:", error);
    return null;
  }
};
