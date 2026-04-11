import { useState, useEffect } from 'react';
import type { UserData } from '../types';
import { useUserDataCache } from './useUserDataCache';
import { MESSAGES } from '../constants/messages';

interface DashboardDataResponse {
  data?: UserData;
  error?: string;
}

async function fetchDashboardData(): Promise<{ status: number; payload: DashboardDataResponse }> {
  const response = await fetch('/api/data');
  const payload = await response.json() as DashboardDataResponse;
  return { status: response.status, payload };
}

export function useDashboardData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const { lastUpdated, loadFromCache, saveToCache } = useUserDataCache();

  function applyLoadedData(next: UserData): void {
    setUserData(next);
    setError(null);
    setShowLogin(false);
    saveToCache(next);
  }

  useEffect(() => {
    async function loadData(): Promise<void> {
      try {
        const cached = loadFromCache();
        if (cached) {
          setUserData(cached.data);
          setShowLogin(false);
          setLoading(false);
        }

        const { status, payload } = await fetchDashboardData();

        if (status === 400 && payload.error === 'Not configured') {
          if (!cached) setShowLogin(true);
          return;
        }

        if (payload.data) {
          applyLoadedData(payload.data);
        } else if (payload.error !== 'Not configured') {
          setError(payload.error || MESSAGES.ERROR.LOAD_FAILED);
          setShowLogin(false);
        }
      } catch {
        setError(MESSAGES.ERROR.SERVER_FAILED);
        setShowLogin(false);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function refresh(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const { payload } = await fetchDashboardData();
      if (payload.data) {
        applyLoadedData(payload.data);
      } else {
        setError(payload.error || MESSAGES.ERROR.REFRESH_FAILED);
      }
    } catch {
      setError(MESSAGES.ERROR.RETRY_LATER);
    } finally {
      setLoading(false);
    }
  }

  return {
    userData,
    loading,
    error,
    showLogin,
    lastUpdated,
    refresh,
    setUserData: applyLoadedData,
  };
}
