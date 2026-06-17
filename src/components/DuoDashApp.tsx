import React, { useState, useMemo } from 'react';
import type { UserData } from '../types';
import { LoginScreen, Navbar } from './dashboard';
import { DashboardView } from './dashboard/DashboardView';
import { LoadingScreen, ErrorScreen } from './dashboard';
import { ShareModal } from './share';
import { useDashboardData } from '../hooks/useDashboardData';
import { buildDemoData } from '../utils/demo-data';
import { MESSAGES } from '../constants/messages';

const PLACEHOLDER_DATA: UserData = {
  streak: 0,
  totalXp: 0,
  gems: 0,
  league: MESSAGES.PLACEHOLDER.LOADING,
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

function DuoDashApp(): React.ReactElement {
  const { userData, loading, error, showLogin, lastUpdated, isDemo, setIsDemo, refresh, resetToLogin, setUserData } = useDashboardData();
  const [showShareModal, setShowShareModal] = useState(false);

  function handleDemo(): void {
    localStorage.setItem('duodash:isDemo', 'true');
    setIsDemo(true);
    setUserData(buildDemoData());
  }

  function handleExitDemo(): void {
    resetToLogin();
  }

  const viewData = userData ?? PLACEHOLDER_DATA;
  const hasUserData = userData !== null;
  const hasTimeHistory = viewData.dailyTimeHistory?.some((day) => day.time > 0) ?? false;
  const hasYearlyHistory = Boolean(userData?.yearlyXpHistory?.length);

  const xpSummary = useMemo(() => {
    const total = viewData.dailyXpHistory.reduce((sum, d) => sum + d.xp, 0);
    return `近 7 天共获得 ${total} XP`;
  }, [viewData.dailyXpHistory]);

  const timeSummary = useMemo(() => {
    const total = (viewData.dailyTimeHistory ?? []).reduce((sum, d) => sum + d.time, 0);
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return `近 7 天学习 ${hours > 0 ? `${hours}小时${mins}分钟` : `${mins}分钟`}`;
  }, [viewData.dailyTimeHistory]);

  if (loading && !hasUserData) {
    return <LoadingScreen />;
  }

  if (!hasUserData && !showLogin && Boolean(error)) {
    return <ErrorScreen error={error!} onRetry={refresh} />;
  }

  if (!hasUserData && showLogin) {
    return (
      <LoginScreen
        onDemo={handleDemo}
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-background">
      {isDemo && (
        <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
            <span className="text-amber-800 text-xs font-bold">
              当前正在浏览演示数据。
            </span>
            <button
              onClick={handleExitDemo}
              className="text-xs font-extrabold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-1 rounded-button transition-colors cursor-pointer"
            >
              配置真实数据
            </button>
          </div>
        </div>
      )}

      <Navbar loading={loading} lastUpdated={lastUpdated} onRefresh={refresh} onShare={() => setShowShareModal(true)} />

      <DashboardView
        userData={userData}
        viewData={viewData}
        xpSummary={xpSummary}
        timeSummary={timeSummary}
      />

      {userData && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          userData={userData}
        />
      )}
    </div>
  );
}

export default DuoDashApp;
