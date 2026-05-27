import AsyncStorage from '@react-native-async-storage/async-storage';
import { Capsule } from '../types/capsule';

const CAPSULES_DAY_CACHE_PREFIX = '@capsules_day_cache_';

// The remote base URL folder under which monthly issue folders are stored (e.g. .../months/05-26/27.json)
const REMOTE_FOLDER_URL = 'https://raw.githubusercontent.com/satyam-x10/capsule/data/data';

// Fallback in-memory and window.localStorage storage when AsyncStorage native module is null (web / unlinked)
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
}

const fallbackStorage = new FallbackStorage();

const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e: any) {
      console.warn('[capsuleApi] AsyncStorage.getItem failed, falling back to local memory:', e);
      return await fallbackStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e: any) {
      console.warn('[capsuleApi] AsyncStorage.setItem failed, falling back to local memory:', e);
      await fallbackStorage.setItem(key, value);
    }
  }
};

/**
 * Returns the current date in YYYY-MM-DD format (local time zone)
 */
export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns the current month ID in MM-YY format
 */
export function getCurrentMonthId(): string {
  return getMonthIdFromDate(getTodayDateStr());
}

/**
 * Parses YYYY-MM-DD to extract the month ID in MM-YY format
 */
export function getMonthIdFromDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return '';
  const [yearStr, monthStr] = dateStr.split('-');
  const yearShort = yearStr.slice(-2);
  return `${monthStr}-${yearShort}`;
}

/**
 * Parses YYYY-MM-DD to extract the day ID in DD format
 */
export function getDayIdFromDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes('-')) return '';
  const parts = dateStr.split('-');
  return parts[2] || '';
}

/**
 * Fetches the capsules for a specific day from the remote directory or reads from cache.
 * URL format: REMOTE_FOLDER_URL/MM-YY/DD.json
 */
export async function getDayCapsules(dateStr: string): Promise<Capsule[]> {
  const cacheKey = `${CAPSULES_DAY_CACHE_PREFIX}${dateStr}`;
  
  try {
    // Check if we have cached data for this day
    const cachedData = await safeStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    
    // Parse month and day IDs
    const monthId = getMonthIdFromDate(dateStr);
    const dayId = getDayIdFromDate(dateStr);
    
    if (!monthId || !dayId) {
      throw new Error(`Invalid date string: ${dateStr}`);
    }
    
    // Fetch from remote folder: e.g. REMOTE_FOLDER_URL/05-26/27.json
    const targetUrl = `${REMOTE_FOLDER_URL}/${monthId}/${dayId}.json`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch day ${dateStr} from ${targetUrl}: status ${response.status}`);
    }
    
    const fetchedData = await response.json();
    if (Array.isArray(fetchedData)) {
      // Store to cache permanently (since historical daily data is immutable)
      await safeStorage.setItem(cacheKey, JSON.stringify(fetchedData));
      return fetchedData;
    } else {
      throw new Error('Fetched data is not a valid array');
    }
  } catch (error) {
    console.error(`[capsuleApi] Failed to retrieve capsules for date ${dateStr}:`, error);
    throw error;
  }
}
