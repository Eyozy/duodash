import { Suspense, lazy } from 'react';
import type { ReactElement } from 'react';
import type { UserData } from '../../types';
import { PageHeader, StatCard, CourseList, TodayOverview } from './index';
import { AccountAgeIcon, CourseIcon, HeatmapIcon, TimeIcon, TotalXpIcon, TrendIcon } from '../icons';
import { MESSAGES } from '../../constants/messages';
import { CHART_COLORS } from '../charts/chartConfig';

const LazyAreaHistoryChart = lazy(() => import('../charts/AreaHistoryChart'));
const LazyHeatmapChart = lazy(() => import('../charts/HeatmapChart').then(m => ({ default: m.HeatmapChart })));
const LazyAchievementsSection = lazy(() => import('../achievements/AchievementsSection').then((m) => ({ default: m.AchievementsSection })));
const LazyAiCoach = lazy(() => import('./AiCoach').then(m => ({ default: m.AiCoach })));

function ChartSkeleton(): ReactElement {
  return (
    <div className="panel-card-muted flex h-40 w-full items-center justify-center animate-pulse">
      <span className="text-neutral-500 text-sm">{MESSAGES.LOADING.PLACEHOLDER}</span>
    </div>
  );
}

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

interface DashboardViewProps {
  userData: UserData | null;
  viewData: UserData;
  xpSummary: string;
  timeSummary: string;
}

export function DashboardView({ userData, viewData, xpSummary, timeSummary }: DashboardViewProps): ReactElement {
  const hasUserData = userData !== null;
  const hasTimeHistory = viewData.dailyTimeHistory?.some((day) => day.time > 0) ?? false;
  const hasYearlyHistory = Boolean(userData?.yearlyXpHistory?.length);

  return (
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
                    <LazyAreaHistoryChart
                      data={viewData.dailyXpHistory}
                      dataKey="xp"
                      color={CHART_COLORS.xp}
                      label="经验值"
                      summary={xpSummary}
                    />
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
                      <LazyAreaHistoryChart
                        data={viewData.dailyTimeHistory!}
                        dataKey="time"
                        color={CHART_COLORS.time}
                        label="学习时间"
                        summary={timeSummary}
                      />
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
  );
}
