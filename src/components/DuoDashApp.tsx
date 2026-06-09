import React, { useState, Suspense, lazy } from 'react';
import type { UserData } from '../types';
import { LoginScreen } from './LoginScreen';
import { Navbar, PageHeader, StatCard, CourseList, TodayOverview } from './dashboard';
import { LoadingScreen, ErrorScreen } from './dashboard';
import { ShareModal } from './share';
import { AccountAgeIcon, CourseIcon, HeatmapIcon, TimeIcon, TotalXpIcon, TrendIcon } from './icons';
import { useDashboardData } from '../hooks/useDashboardData';
import { buildDemoData } from '../utils/demo-data';
import { MESSAGES } from '../constants/messages';

const LazyXpHistoryChart = lazy(() => import('./charts/XpHistoryChart'));
const LazyTimeHistoryChart = lazy(() => import('./charts/TimeHistoryChart'));
const LazyHeatmapChart = lazy(() => import('./Charts').then(m => ({ default: m.HeatmapChart })));
const LazyAchievementsSection = lazy(() => import('./achievements/AchievementsSection').then((m) => ({ default: m.AchievementsSection })));
const LazyAiCoach = lazy(() => import('./AiCoach').then(m => ({ default: m.AiCoach })));

function ChartSkeleton(): React.ReactElement {
  return (
    <div className="panel-card-muted flex h-40 w-full items-center justify-center animate-pulse">
      <span className="text-neutral-500 text-sm">{MESSAGES.LOADING.PLACEHOLDER}</span>
    </div>
  );
}

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

const STAT_CARDS = [
  {
    icon: <TimeIcon className="w-5 h-5 text-status-info" />,
    iconBgClass: 'bg-status-info-bg',
    label: '预估投入时间',
    colorClass: 'text-status-info',
    value: (data: UserData) => data.estimatedLearningTime,
  },
  {
    icon: <TotalXpIcon className="w-6 h-6 text-yellow-500" />,
    iconBgClass: 'bg-yellow-50',
    label: '总经验',
    colorClass: 'text-yellow-500',
    value: (data: UserData) => data.totalXp.toLocaleString(),
  },
  {
    icon: <CourseIcon className="w-5 h-5 text-brand-500" />,
    iconBgClass: 'bg-brand-50',
    label: '学习课程',
    colorClass: 'text-brand-500',
    value: (data: UserData) => data.courses.length,
  },
  {
    icon: <AccountAgeIcon className="w-5 h-5 text-purple-500" />,
    iconBgClass: 'bg-purple-50',
    label: '账号年龄',
    colorClass: 'text-purple-500',
    value: (data: UserData) => `${data.accountAgeDays} 天`,
  },
] as const;

function DuoDashApp(): React.ReactElement {
  const { userData, loading, error, showLogin, lastUpdated, refresh, setUserData } = useDashboardData();
  const [showShareModal, setShowShareModal] = useState(false);

  function handleJsonInput(jsonStr: string): void {
    import('../services/duolingoService')
      .then(({ transformDuolingoData }) => {
        try {
          const raw = JSON.parse(jsonStr);
          const userObj = raw.users ? raw.users[0] : raw;
          setUserData(transformDuolingoData(userObj));
        } catch {
        }
      })
      .catch(() => {
      });
  }

  function handleDemo(): void {
    setUserData(buildDemoData());
  }

  const viewData = userData ?? PLACEHOLDER_DATA;
  const hasUserData = userData !== null;
  const hasTimeHistory = viewData.dailyTimeHistory?.some((day) => day.time > 0) ?? false;
  const hasYearlyHistory = Boolean(userData?.yearlyXpHistory?.length);

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
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-surface-background">
      <Navbar loading={loading} lastUpdated={lastUpdated} onRefresh={refresh} onShare={() => setShowShareModal(true)} />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pb-2 sm:pb-3">
        <div className="max-w-7xl mx-auto rounded-3xl bg-surface-background">
          <div className="px-0 pt-2 pb-1 sm:px-2 sm:pt-4 sm:pb-2 md:px-4 lg:px-6">
            <PageHeader userData={userData} viewData={viewData} />

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
                {STAT_CARDS.map((card) => (
                  <StatCard
                    key={card.label}
                    icon={card.icon}
                    iconBgClass={card.iconBgClass}
                    value={userData ? card.value(viewData) : '—'}
                    label={card.label}
                    colorClass={card.colorClass}
                  />
                ))}
              </div>

              <div className={`grid gap-3 sm:gap-4 ${hasTimeHistory ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} w-full`}>
                <div className="panel-card flex w-full min-w-0 flex-col gap-2 p-3 sm:p-4">
                  <h2 className="panel-title text-base sm:text-lg">
                    <TrendIcon className="panel-title-icon h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="leading-none">最近 7 天经验</span>
                  </h2>
                  {hasUserData ? (
                    <Suspense fallback={<ChartSkeleton />}>
                      <LazyXpHistoryChart data={viewData.dailyXpHistory} />
                    </Suspense>
                  ) : (
                    <ChartSkeleton />
                  )}
                </div>
                {hasTimeHistory && (
                  <div className="panel-card flex w-full min-w-0 flex-col gap-2 p-3 sm:p-4">
                    <h2 className="panel-title text-base sm:text-lg">
                      <TimeIcon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-status-info" />
                      <span className="leading-none">最近 7 天学习时间</span>
                    </h2>
                    {hasUserData ? (
                      <Suspense fallback={<ChartSkeleton />}>
                        <LazyTimeHistoryChart data={viewData.dailyTimeHistory!} />
                      </Suspense>
                    ) : (
                      <ChartSkeleton />
                    )}
                  </div>
                )}
              </div>

              <CourseList courses={viewData.courses} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                <div className="lg:col-span-2">
                  {userData ? (
                    <Suspense fallback={<div className="panel-card h-32 animate-pulse p-4 sm:p-6" />}>
                      <LazyAiCoach userData={userData} />
                    </Suspense>
                  ) : (
                    <div className="panel-card h-32 animate-pulse p-4 sm:p-6" />
                  )}
                </div>
                <TodayOverview userData={userData} />
              </div>

              {hasYearlyHistory && (
                <div className="panel-card animate-fade-in-up p-4 sm:p-6">
                  <h2 className="panel-title mb-3 sm:mb-4 text-base sm:text-lg">
                    <HeatmapIcon className="panel-title-icon h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="leading-none">年度学习热力图</span>
                  </h2>
                  <Suspense fallback={<div className="h-40 sm:h-48 w-full bg-neutral-100 rounded-card animate-pulse" />}>
                    <LazyHeatmapChart data={userData!.yearlyXpHistory!} />
                  </Suspense>
                </div>
              )}

              {hasYearlyHistory && (
                <div className="animate-fade-in-up">
                  <Suspense fallback={<div className="h-48 sm:h-64 w-full bg-neutral-100 rounded-card animate-pulse" />}>
                    <LazyAchievementsSection data={userData!.yearlyXpHistory!} />
                  </Suspense>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

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
