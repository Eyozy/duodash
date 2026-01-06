import React, { useState, useEffect, Suspense, lazy } from 'react';
import type { UserData } from '../types';
import { LoginScreen } from './LoginScreen';
import { Navbar, PageHeader, StatCard, CourseList, TodayOverview } from './dashboard';

// Lazy load heavy chart components for better initial load
const LazyXpHistoryChart = lazy(() => import('./charts/XpHistoryChart'));
const LazyTimeHistoryChart = lazy(() => import('./charts/TimeHistoryChart'));
const LazyHeatmapChart = lazy(() => import('./Charts').then(m => ({ default: m.HeatmapChart })));
const LazyAchievementsSection = lazy(() => import('./AchievementsSection'));
const LazyAiCoach = lazy(() => import('./AiCoach').then(m => ({ default: m.AiCoach })));

// Chart loading fallback with fixed height to prevent CLS
const ChartSkeleton = () => (
  <div className="h-40 w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center" style={{ minHeight: '160px' }}>
    <span className="text-gray-600 text-sm">加载中...</span>
  </div>
);

// 入场动画样式 - 优化为更快的动画，减少延迟
const animationStyles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-seq {
  animation: fadeInUp 0.2s ease-out forwards;
  opacity: 0;
}

/* 缩短动画延迟 - 每个间隔 100ms */
.seq-1 { animation-delay: 0s; }
.seq-2 { animation-delay: 0.1s; }
.seq-3 { animation-delay: 0.15s; }
.seq-4 { animation-delay: 0.2s; }
.seq-5 { animation-delay: 0.25s; }
.seq-6 { animation-delay: 0.3s; }
.seq-7 { animation-delay: 0.35s; }
.seq-8 { animation-delay: 0.4s; }
.seq-9 { animation-delay: 0.45s; }
.seq-10 { animation-delay: 0.5s; }
.seq-11 { animation-delay: 0.55s; }
.seq-12 { animation-delay: 0.6s; }
`;

const DEMO_DATA: UserData = {
  streak: 2045,
  totalXp: 202663,
  gems: 15400,
  league: "钻石 (Diamond)",
  leagueTier: 9,
  learningLanguage: "Spanish",
  creationDate: "2015 年 5 月 12 日",
  accountAgeDays: 3200,
  isPlus: true,
  dailyGoal: 50,
  estimatedLearningTime: "562 小时 57 分钟",
  courses: [
    { id: 'es', title: "Spanish", xp: 125000, fromLanguage: "en", learningLanguage: "es", crowns: 150 },
    { id: 'fr', title: "French", xp: 55000, fromLanguage: "en", learningLanguage: "fr", crowns: 45 },
    { id: 'de', title: "German", xp: 12000, fromLanguage: "en", learningLanguage: "de", crowns: 20 },
    { id: 'jp', title: "Japanese", xp: 2500, fromLanguage: "en", learningLanguage: "ja", crowns: 5 },
  ],
  dailyXpHistory: [
    { date: '11/29', xp: 120 }, { date: '11/30', xp: 250 }, { date: '12/1', xp: 45 },
    { date: '12/2', xp: 320 }, { date: '12/3', xp: 150 }, { date: '12/4', xp: 550 }, { date: '12/5', xp: 400 },
  ],
  dailyTimeHistory: [
    { date: '11/29', time: 40 }, { date: '11/30', time: 83 }, { date: '12/1', time: 15 },
    { date: '12/2', time: 107 }, { date: '12/3', time: 50 }, { date: '12/4', time: 183 }, { date: '12/5', time: 133 },
  ],
  xpToday: 180,
  lessonsToday: 5,
  streakExtendedToday: true,
  streakExtendedTime: "09:32"
};

const PLACEHOLDER_DATA: UserData = {
  streak: 0,
  totalXp: 0,
  gems: 0,
  league: '加载中…',
  leagueTier: -1,
  learningLanguage: '—',
  creationDate: '—',
  accountAgeDays: 0,
  isPlus: false,
  dailyGoal: 0,
  estimatedLearningTime: '—',
  courses: [],
  dailyXpHistory: [],
  dailyTimeHistory: [],
  yearlyXpHistory: [],
};

export const DuoDashApp: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [shouldRenderHeatmap, setShouldRenderHeatmap] = useState(false);
  const [shouldRenderAboveFoldCharts, setShouldRenderAboveFoldCharts] = useState(false);
  const heatmapSentinelRef = React.useRef<HTMLDivElement | null>(null);

  // 自动加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        let hasLocalCache = false;
        try {
          const cached = localStorage.getItem('duodash:userData');
          const cachedTs = localStorage.getItem('duodash:userDataTs');
          if (cached) {
            const parsed = JSON.parse(cached) as UserData;
            setUserData(parsed);
            setIsConfigured(true);
            setShowLogin(false);
            hasLocalCache = true;
            if (cachedTs) setLastUpdated(Number(cachedTs) || null);
          }
        } catch {
          // ignore cache errors
        }

        await new Promise<void>(resolve => setTimeout(resolve, 0));

        const dataRes = await fetch('/api/data');

        if (dataRes.status === 400) {
          const res = await dataRes.json();
          if (res.error === 'Not configured') {
            if (!hasLocalCache) setShowLogin(true);
            setLoading(false);
            return;
          }
        }

        const result = await dataRes.json();

        if (result.data) {
          const next = result.data as UserData;
          setUserData(next);
          setIsConfigured(true);
          setShowLogin(false);
          try {
            localStorage.setItem('duodash:userData', JSON.stringify(next));
            localStorage.setItem('duodash:userDataTs', String(Date.now()));
            setLastUpdated(Date.now());
          } catch {
            // ignore persistence errors
          }
        } else {
          if (result.error !== 'Not configured') {
            setError(result.error || '加载数据失败');
            setIsConfigured(true);
          }
        }
      } catch {
        setError('连接服务器失败');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 热力图懒加载
  useEffect(() => {
    if (!userData?.yearlyXpHistory || userData.yearlyXpHistory.length === 0) return;
    if (shouldRenderHeatmap) return;

    const el = heatmapSentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setShouldRenderHeatmap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [userData?.yearlyXpHistory?.length, shouldRenderHeatmap]);

  // 图表立即渲染优化
  useEffect(() => {
    if (!userData) {
      setShouldRenderAboveFoldCharts(false);
      return;
    }

    // 立即渲染图表以加快LCP
    setShouldRenderAboveFoldCharts(true);
  }, [userData]);

  const handleConnect = async (username: string, jwt: string) => {
    setLoading(true);
    setError(null);
    try {
      const { fetchDuolingoData } = await import('../services/duolingoService');
      const data = await fetchDuolingoData(username, jwt);
      setUserData(data);
      setShowLogin(false);
    } catch {
      setError("连接失败：请尝试使用「粘贴 JSON」模式，或检查环境变量配置。");
    } finally {
      setLoading(false);
    }
  };

  const handleJsonInput = (jsonStr: string) => {
    (async () => {
      try {
        const { transformDuolingoData } = await import('../services/duolingoService');
        const raw = JSON.parse(jsonStr);
        const userObj = raw.users ? raw.users[0] : raw;
        const transformed = transformDuolingoData(userObj);
        setUserData(transformed);
        setShowLogin(false);
      } catch {
        setError("JSON 格式无效。请确保你复制了完整的页面内容。");
      }
    })();
  };

  const handleDemo = () => {
    setUserData(DEMO_DATA);
    setShowLogin(false);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const dataRes = await fetch('/api/data');
      const result = await dataRes.json();

      if (result.data) {
        const next = result.data as UserData;
        setUserData(next);
        setShowLogin(false);
        try {
          localStorage.setItem('duodash:userData', JSON.stringify(next));
          localStorage.setItem('duodash:userDataTs', String(Date.now()));
          setLastUpdated(Date.now());
        } catch {
          // ignore persistence errors
        }
      } else {
        setError(result.error || '刷新数据失败');
      }
    } catch {
      setError('刷新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 全屏加载页面 - 首次加载时显示
  if (loading && !userData) {
    return (
      <div className="min-h-screen bg-[#235390] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6">
          {/* Duolingo 风格的加载动画 */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-[#58cc02] flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-white/30 border-t-white animate-spin" />
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-bold mb-2">正在加载数据</h2>
            <p className="text-white/70 text-sm">请稍候...</p>
          </div>
        </div>
      </div>
    );
  }

  // 错误页面
  if (!userData && isConfigured && error) {
    return (
      <div className="min-h-screen bg-[#235390] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-6">😢</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-4">连接失败</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <p className="text-gray-700 text-sm mb-6">请检查环境变量中的 DUOLINGO_USERNAME 和 DUOLINGO_JWT 配置是否正确</p>
          <button onClick={() => window.location.reload()}
            className="bg-[#58cc02] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#4caf00]">
            重试
          </button>
        </div>
      </div>
    );
  }

  // 登录页面
  if (!userData && showLogin) {
    return <LoginScreen onConnect={handleConnect} onJsonInput={handleJsonInput} onDemo={handleDemo} loading={loading} error={error} />;
  }

  const viewData = userData ?? PLACEHOLDER_DATA;

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <style>{animationStyles}</style>

      <Navbar loading={loading} lastUpdated={lastUpdated} onRefresh={handleRefresh} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader userData={userData} viewData={viewData} />

        <div className="space-y-6">
          {/* 统计卡片 - 优化为自适应高度 */}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
            <StatCard icon="⚡" value={userData ? viewData.totalXp.toLocaleString() : '—'} label="总经验" colorClass="text-yellow-500" seq={1} />
            <StatCard icon="📅" value={userData ? viewData.accountAgeDays : '—'} label="注册天数" colorClass="text-blue-500" seq={2} />
            <StatCard icon="📚" value={userData ? viewData.courses.length : '—'} label="学习课程" colorClass="text-teal-500" seq={3} />
            <StatCard icon="⏱️" value={userData ? viewData.estimatedLearningTime : '—'} label="预估投入" colorClass="text-purple-500" seq={4} isLargeText={false} />
          </div>

          {/* 图表和语言分布 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 grid gap-4 ${viewData.dailyTimeHistory && viewData.dailyTimeHistory.some(d => d.time > 0) ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200 animate-seq seq-5">
                <h2 className="text-gray-700 font-bold text-lg mb-3 flex items-center gap-2">
                  <span>⚡</span> 最近 7 天经验
                </h2>
                {userData ? (
                  shouldRenderAboveFoldCharts ? (
                    <Suspense fallback={<ChartSkeleton />}>
                      <LazyXpHistoryChart data={viewData.dailyXpHistory} />
                    </Suspense>
                  ) : (
                    <ChartSkeleton />
                  )
                ) : (
                  <ChartSkeleton />
                )}
              </div>
              {viewData.dailyTimeHistory && viewData.dailyTimeHistory.some(d => d.time > 0) && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200 animate-seq seq-6">
                  <h2 className="text-gray-700 font-bold text-lg mb-3 flex items-center gap-2">
                    <span>⏱️</span> 最近 7 天学习时间
                  </h2>
                  {userData ? (
                    shouldRenderAboveFoldCharts ? (
                      <Suspense fallback={<ChartSkeleton />}>
                        <LazyTimeHistoryChart data={viewData.dailyTimeHistory} />
                      </Suspense>
                    ) : (
                      <ChartSkeleton />
                    )
                  ) : (
                    <ChartSkeleton />
                  )}
                </div>
              )}
            </div>
            <CourseList courses={viewData.courses} seq={7} />
          </div>

          {/* AI 点评和今日概览 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 animate-seq seq-8">
              {userData ? (
                <Suspense fallback={<div className="bg-white rounded-2xl p-6 h-32 animate-pulse" />}>
                  <LazyAiCoach userData={userData} />
                </Suspense>
              ) : (
                <div className="bg-white rounded-2xl p-6 h-32 animate-pulse" />
              )}
            </div>
            <TodayOverview userData={userData} seq={9} />
          </div>

          {/* 年度学习热力图 */}
          {userData && userData.yearlyXpHistory && userData.yearlyXpHistory.length > 0 && (
            <div
              ref={heatmapSentinelRef}
              className="bg-white rounded-2xl p-6 shadow-sm border-2 border-b-4 border-gray-200 animate-seq seq-10"
            >
              <h2 className="text-gray-700 font-bold text-xl mb-4">📅 年度学习热力图</h2>
              {shouldRenderHeatmap ? (
                <Suspense fallback={<div className="h-48 w-full bg-gray-100 rounded-xl animate-pulse" />}>
                  <LazyHeatmapChart data={userData.yearlyXpHistory} />
                </Suspense>
              ) : (
                <div className="h-48 w-full bg-gray-50 rounded-xl flex items-center justify-center text-gray-600 text-sm">
                  向下滚动时加载热力图…
                </div>
              )}
            </div>
          )}

          {/* 成就殿堂 - 独立区域 */}
          {userData && userData.yearlyXpHistory && userData.yearlyXpHistory.length > 0 && (
            <div className="animate-seq seq-11">
              <Suspense fallback={<div className="h-64 w-full bg-gray-100 rounded-2xl animate-pulse" />}>
                <LazyAchievementsSection data={userData.yearlyXpHistory} />
              </Suspense>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DuoDashApp;
