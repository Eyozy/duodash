import { forwardRef } from 'react';
import { WeeklyReportIcon } from '../../icons';

interface WeeklySummaryData {
  daysLearned: number;
  activeStreak: number;
  completionRate: number;
  averageXp: number;
  bestDayLabel: string;
  bestDayXp: number;
  totalXp: number;
  totalTime: string;
  dateRange: string;
}

interface WeeklySummaryCardProps {
  summary: WeeklySummaryData;
}

const STATUS_CONFIG = [
  { minDays: 6, label: '火力全开', toneClass: 'text-brand-600', badgeClass: 'border-brand-100 bg-brand-50 text-brand-600' },
  { minDays: 4, label: '稳定推进', toneClass: 'text-status-info', badgeClass: 'border-status-info bg-status-info-bg text-status-info' },
  { minDays: 2, label: '持续积累', toneClass: 'text-yellow-600', badgeClass: 'border-yellow-100 bg-yellow-50 text-yellow-600' },
  { minDays: 0, label: '重新起步', toneClass: 'text-neutral-500', badgeClass: 'border-neutral-100 bg-surface-background text-neutral-500' },
] as const;

function getWeeklyStatus(daysLearned: number) {
  return STATUS_CONFIG.find((item) => daysLearned >= item.minDays) ?? STATUS_CONFIG[STATUS_CONFIG.length - 1];
}

export const WeeklySummaryCard = forwardRef<HTMLDivElement, WeeklySummaryCardProps>(
  ({ summary }, ref) => {
    const { daysLearned, activeStreak, completionRate, averageXp, bestDayLabel, bestDayXp, totalXp, totalTime, dateRange } = summary;
    const status = getWeeklyStatus(daysLearned);
    const progressPercent = Math.min(100, Math.max(12, (daysLearned / 7) * 100));
    const highlight = activeStreak >= 3
      ? `已经连续活跃 ${activeStreak} 天，节奏很稳。`
      : bestDayXp > 0
        ? `${bestDayLabel} 单日冲到 ${bestDayXp} XP，是这一周的高光时刻。`
        : '这一周刚重新起步，下一次打开就是新的开始。';

    return (
      <div
        ref={ref}
        className="panel-card relative mx-auto flex aspect-[4/5] w-full max-w-[340px] sm:max-w-[360px] flex-col overflow-hidden rounded-[24px] sm:rounded-[28px] border-[2.5px] sm:border-[3px] border-slate-300 bg-gradient-to-b from-status-info-bg via-white to-white p-4 sm:p-5 shadow-[0_12px_48px_rgba(15,23,42,0.18)]"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(28,176,246,0.18),transparent_28%)]" />
        <div className="pointer-events-none absolute -right-12 top-16 h-40 w-40 rounded-full bg-white/50 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.4))]" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="inline-flex items-center rounded-pill border border-status-info bg-white px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold text-status-info">
              本周报告
            </div>
            <div className="text-right text-[10px] sm:text-xs font-semibold text-neutral-500">
              {dateRange}
            </div>
          </div>

          <div className="mt-3 sm:mt-4 flex flex-col items-start gap-2.5 sm:gap-3 text-left">
            <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-[14px] sm:rounded-[16px] border border-status-info bg-white shadow-sm">
              <WeeklyReportIcon className="h-7 w-7 sm:h-8 sm:w-8 text-status-info" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.22em] sm:tracking-[0.24em] text-neutral-500">
                一周进展
              </div>
              <div className="mt-1 text-[1.65rem] sm:text-[1.8rem] md:text-[2rem] font-black tracking-[-0.03em] text-neutral-800">
                {totalXp.toLocaleString()} XP
              </div>
              <div className="mt-1.5 text-xs sm:text-sm font-semibold text-neutral-500">
                完成率 {completionRate}% · 日均 {averageXp.toLocaleString()} XP
              </div>
            </div>
          </div>

          <div data-export-card="inner" className="mt-3 sm:mt-4 rounded-[20px] sm:rounded-[24px] border border-slate-200/80 bg-white/88 p-3.5 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs sm:text-sm font-semibold text-neutral-800">
                本周学习了 {daysLearned} 天
              </div>
              <span className={`inline-flex items-center rounded-pill border px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold ${status.badgeClass}`}>
                {status.label}
              </span>
            </div>
            <div className="mt-2.5 sm:mt-3 h-1.5 sm:h-2 rounded-pill bg-surface-background">
              <div className="h-full rounded-pill bg-brand-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">
            <div data-export-card="inner" className="rounded-[18px] sm:rounded-[20px] border border-slate-200/80 bg-white/94 px-3 sm:px-4 py-3 sm:py-3.5">
              <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.22em] text-neutral-500">
                学习时长
              </div>
              <div className="mt-1.5 text-sm sm:text-base md:text-lg font-black text-neutral-800 tabular-nums">
                {totalTime}
              </div>
            </div>
            <div data-export-card="inner" className="rounded-[18px] sm:rounded-[20px] border border-slate-200/80 bg-white/94 px-3 sm:px-4 py-3 sm:py-3.5">
              <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.22em] text-neutral-500">
                最强一天
              </div>
              <div className="mt-1.5 text-sm sm:text-base md:text-lg font-black text-neutral-800 tabular-nums">
                {bestDayXp > 0 ? `${bestDayLabel} · ${bestDayXp}` : '待解锁'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WeeklySummaryCard.displayName = 'WeeklySummaryCard';
