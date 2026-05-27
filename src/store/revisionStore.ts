import AsyncStorage from '@react-native-async-storage/async-storage';
import { Revision } from '../types/capsule';

const STORAGE_KEY = '@capsule_revisions';

// In-memory fallback database for development environments/Expo Go where native storage modules are unlinked
class FallbackStorage {
  private memoryStore: Record<string, string> = {};

  async getItem(key: string): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {}
    return this.memoryStore[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {}
    this.memoryStore[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {}
    delete this.memoryStore[key];
  }
}

const fallback = new FallbackStorage();

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      // Direct call will throw if Native module is null
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.warn('[revisionStore] AsyncStorage failed, falling back to local storage/memory:', e);
      return await fallback.getItem(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.warn('[revisionStore] AsyncStorage failed, falling back to local storage/memory:', e);
      await fallback.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.warn('[revisionStore] AsyncStorage failed, falling back to local storage/memory:', e);
      await fallback.removeItem(key);
    }
  }
};

export async function getRevisions(): Promise<Revision[]> {
  try {
    const data = await safeStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[revisionStore] Failed to get revisions:', error);
    return [];
  }
}

export async function saveRevision(
  capsuleId: string,
  capsuleTitle: string,
  category: string,
  note: string
): Promise<Revision[]> {
  try {
    const current = await getRevisions();
    const existingIndex = current.findIndex((r) => r.capsuleId === capsuleId);

    const newRevision: Revision = {
      capsuleId,
      capsuleTitle,
      category,
      note: note.trim(),
      savedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };

    if (existingIndex > -1) {
      current[existingIndex] = newRevision;
    } else {
      current.unshift(newRevision); // Add new revisions to the top
    }

    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return current;
  } catch (error) {
    console.error('[revisionStore] Failed to save revision:', error);
    return [];
  }
}

export async function removeRevision(capsuleId: string): Promise<Revision[]> {
  try {
    const current = await getRevisions();
    const updated = current.filter((r) => r.capsuleId !== capsuleId);
    await safeStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('[revisionStore] Failed to remove revision:', error);
    return [];
  }
}

export async function getRevisionById(capsuleId: string): Promise<Revision | null> {
  try {
    const current = await getRevisions();
    const item = current.find((r) => r.capsuleId === capsuleId);
    return item || null;
  } catch (error) {
    console.error('[revisionStore] Failed to get revision by ID:', error);
    return null;
  }
}

