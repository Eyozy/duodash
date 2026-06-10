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
  const { userData, loading, error, showLogin, lastUpdated, refresh, setUserData } = useDashboardData();
  const [showShareModal, setShowShareModal] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  function handleJsonInput(jsonStr: string): void {
    setParseError(null);
    import('../services/duolingoService')
      .then(({ transformDuolingoData }) => {
        try {
          const raw = JSON.parse(jsonStr);
          const userObj = raw.users ? raw.users[0] : raw;
          setUserData(transformDuolingoData(userObj));
        } catch {
          setParseError('JSON 格式不正确，请检查粘贴的内容是否完整');
        }
      })
      .catch(() => {
        setParseError('解析服务加载失败，请刷新页面重试');
      });
  }

  function handleDemo(): void {
    setUserData(buildDemoData());
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
        onJsonInput={handleJsonInput}
        onDemo={handleDemo}
        loading={loading}
        error={parseError || error}
      />
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-background">
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
