import React, { createContext, useContext, useState, useEffect } from 'react';
import { Capsule } from '../types/capsule';
import { getDayCapsules, getTodayDateStr, getSections, SectionInfo } from '../services/capsuleApi';

interface CapsuleContextType {
  dailyCapsules: Record<string, Capsule[]>;
  sections: SectionInfo[];
  isLoading: boolean;
  error: string | null;
  fetchDayCapsules: (dateStr: string) => Promise<Capsule[]>;
  fetchSections: () => Promise<SectionInfo[]>;
  refresh: () => Promise<void>;
}

const CapsuleContext = createContext<CapsuleContextType>({
  dailyCapsules: {},
  sections: [],
  isLoading: true,
  error: null,
  fetchDayCapsules: async () => [],
  fetchSections: async () => [],
  refresh: async () => {},
});

interface CapsuleProviderProps {
  children: React.ReactNode;
}

export function CapsuleProvider({ children }: CapsuleProviderProps) {
  const [dailyCapsules, setDailyCapsules] = useState<Record<string, Capsule[]>>({});
  const [sections, setSections] = useState<SectionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async (): Promise<SectionInfo[]> => {
    try {
      setError(null);
      const data = await getSections();
      setSections(data);
      return data;
    } catch (err) {
      console.error(`[CapsuleProvider] Failed to fetch sections:`, err);
      setError('An error occurred while loading content.');
      return [];
    }
  };

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
      throw err; // Propagate the error so calling screens can handle it locally
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchSections();
    } catch (err) {
      console.error(`[CapsuleProvider] Refresh failed:`, err);
      setError('An error occurred while loading content.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load sections and today's capsules at app startup
  useEffect(() => {
    refresh();
  }, []);

  return (
    <CapsuleContext.Provider
      value={{
        dailyCapsules,
        sections,
        isLoading,
        error,
        fetchDayCapsules,
        fetchSections,
        refresh,
      }}
    >
      {children}
    </CapsuleContext.Provider>
  );
}

export const useCapsules = () => useContext(CapsuleContext);
