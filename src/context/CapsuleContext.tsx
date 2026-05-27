import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capsule } from '../types/capsule';
import { getDayCapsules, getTodayDateStr } from '../services/capsuleApi';

interface CapsuleContextType {
  dailyCapsules: Record<string, Capsule[]>;
  isLoading: boolean;
  fetchDayCapsules: (dateStr: string) => Promise<Capsule[]>;
}

const CapsuleContext = createContext<CapsuleContextType>({
  dailyCapsules: {},
  isLoading: true,
  fetchDayCapsules: async () => [],
});

interface CapsuleProviderProps {
  children: React.ReactNode;
}

export function CapsuleProvider({ children }: CapsuleProviderProps) {
  const [dailyCapsules, setDailyCapsules] = useState<Record<string, Capsule[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  const fetchDayCapsules = async (dateStr: string): Promise<Capsule[]> => {
    // If already loaded in memory, return it directly
    if (dailyCapsules[dateStr]) {
      return dailyCapsules[dateStr];
    }

    try {
      setIsLoading(true);
      const data = await getDayCapsules(dateStr);
      
      setDailyCapsules((prev) => ({
        ...prev,
        [dateStr]: data,
      }));
      
      return data;
    } catch (err) {
      console.error(`[CapsuleProvider] Failed to fetch day capsules for ${dateStr}:`, err);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Load today's capsules at app startup to populate sections highlights
  useEffect(() => {
    const loadToday = async () => {
      const todayStr = getTodayDateStr();
      await fetchDayCapsules(todayStr);
    };
    loadToday();
  }, []);

  return (
    <CapsuleContext.Provider
      value={{
        dailyCapsules,
        isLoading,
        fetchDayCapsules,
      }}
    >
      {children}
    </CapsuleContext.Provider>
  );
}

export const useCapsules = () => useContext(CapsuleContext);
