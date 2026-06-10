import { useState } from 'react';
import type { UserData } from '../types';
import { CACHE_TTL_MS } from '../constants/config';
import { isFreshSameDayCache } from '../utils/dateUtils';

const USER_DATA_KEY = 'duodash:userData';
const USER_DATA_TS_KEY = 'duodash:userDataTs';

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

interface CachedUserData {
  data: UserData;
  timestamp: number;
}

function readCachedUserData(storage: StorageLike): CachedUserData | null {
  const cached = storage.getItem(USER_DATA_KEY);
  const cachedTs = storage.getItem(USER_DATA_TS_KEY);

  if (!cached || !cachedTs) {
    return null;
  }

  const timestamp = Number(cachedTs);
  if (!Number.isFinite(timestamp) || timestamp <= 0) {
    return null;
  }

  if (!isFreshSameDayCache(timestamp, CACHE_TTL_MS)) {
    return null;
  }

  return {
    data: JSON.parse(cached) as UserData,
    timestamp,
  };
}

function saveCachedUserData(storage: StorageLike, data: UserData, timestamp = Date.now()): void {
  storage.setItem(USER_DATA_KEY, JSON.stringify(data));
  storage.setItem(USER_DATA_TS_KEY, String(timestamp));
}

export function useUserDataCache() {
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  function loadFromCache(): CachedUserData | null {
    try {
      return readCachedUserData(localStorage);
    } catch {
      return null;
    }
  }

  function saveToCache(data: UserData): void {
    const timestamp = Date.now();
    try {
      saveCachedUserData(localStorage, data, timestamp);
    } catch {
    }
    setLastUpdated(timestamp);
  }

  return {
    lastUpdated,
    loadFromCache,
    saveToCache,
  };
}
