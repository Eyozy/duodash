import { useState, useEffect } from 'react';
import type { UserData } from '../types';
import { useUserDataCache } from './useUserDataCache';
import { MESSAGES } from '../constants/messages';

interface DashboardDataResponse {
  data?: UserData;
  error?: string;
}

function getBrowserTimeZone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

async function fetchDashboardData(): Promise<{ status: number; payload: DashboardDataResponse }> {
  const timeZone = getBrowserTimeZone();
  const response = await fetch('/api/data', {
    headers: timeZone ? { 'x-user-timezone': timeZone } : undefined
  });
  const payload = await response.json() as DashboardDataResponse;
  return { status: response.status, payload };
}

const USER_DATA_KEY = 'duodash:userData';
const USER_DATA_TS_KEY = 'duodash:userDataTs';
const IS_DEMO_KEY = 'duodash:isDemo';

export function useDashboardData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const { lastUpdated, loadFromCache, saveToCache } = useUserDataCache();

  function resetToLogin(): void {
    try {
      localStorage.removeItem(USER_DATA_KEY);
      localStorage.removeItem(USER_DATA_TS_KEY);
      localStorage.removeItem(IS_DEMO_KEY);
    } catch {
      // ignore
    }
    setUserData(null);
    setError(null);
    setIsDemo(false);
    setShowLogin(true);
  }

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
          
          // 恢复 Demo 状态
          if (localStorage.getItem(IS_DEMO_KEY) === 'true') {
            setIsDemo(true);
          }
        }

        const { status, payload } = await fetchDashboardData();

        if (status === 400 && payload.error === 'Not configured') {
          if (!cached) setShowLogin(true);
          return;
        }

        if (payload.data) {
          // 如果后端拉到了真实数据，强制关掉 demo 状态
          localStorage.removeItem(IS_DEMO_KEY);
          setIsDemo(false);
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
        localStorage.removeItem(IS_DEMO_KEY);
        setIsDemo(false);
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
    isDemo,
    setIsDemo,
    refresh,
    resetToLogin,
    setUserData: applyLoadedData,
  };
}
