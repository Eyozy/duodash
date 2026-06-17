import { forwardRef } from 'react';
import { WeeklyReportIcon } from '../../icons';
import type { WeeklySummaryData } from '../ShareModal';

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
    const { daysLearned, completionRate, averageXp, bestDayLabel, bestDayXp, totalXp, totalTime, dateRange } = summary;
    const status = getWeeklyStatus(daysLearned);
    const progressPercent = Math.min(100, Math.max(12, (daysLearned / 7) * 100));

    return (
      <div
        ref={ref}
        className="pointer-events-none relative mx-auto flex w-[344px] h-[430px] flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-gradient-to-b from-status-info-bg via-white to-white shadow-lg"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(28,176,246,0.18),transparent_28%)]" />
        <div className="pointer-events-none absolute -right-12 top-16 h-40 w-40 rounded-full bg-white/55 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.4))]" />

        <div className="relative z-10 flex w-full h-full flex-col justify-center p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="inline-flex shrink-0 items-center whitespace-nowrap rounded-pill border border-status-info bg-status-info-bg px-3 py-1 text-xs font-bold text-status-info">
              本周报告
            </div>
            <div className="shrink-0 text-right text-xs font-semibold text-neutral-500">
              {dateRange}
            </div>
          </div>

          <div className="mt-4 flex flex-col items-start gap-3 text-left">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-status-info bg-status-info-bg shadow-sm">
              <WeeklyReportIcon className="h-8 w-8 text-status-info" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-[0.24em] text-neutral-500">
                一周进展
              </div>
              <div className="mt-1 text-[1.8rem] font-black tracking-[-0.03em] text-status-info">
                {totalXp.toLocaleString()} XP
              </div>
              <div className="mt-1.5 text-sm font-semibold text-neutral-500">
                完成率 {completionRate}% · 日均 {averageXp.toLocaleString()} XP
              </div>
            </div>
          </div>

          <div data-export-card="inner" className="mt-4 rounded-[10px] border border-slate-200/80 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold text-neutral-800">
                本周学习了 {daysLearned} 天
              </div>
              <span className={`inline-flex items-center rounded-pill border px-3 py-1 text-xs font-bold ${status.badgeClass}`}>
                {status.label}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-pill bg-surface-background">
              <div className="h-full rounded-pill bg-brand-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div data-export-card="inner" className="rounded-[8px] border border-slate-200/80 bg-white px-4 py-3.5">
              <div className="text-[11px] font-bold tracking-[0.22em] text-neutral-500">
                学习时长
              </div>
              <div className="mt-1.5 text-base font-black text-neutral-800 tabular-nums">
                {totalTime}
              </div>
            </div>
            <div data-export-card="inner" className="rounded-[8px] border border-slate-200/80 bg-white px-4 py-3.5">
              <div className="text-[11px] font-bold tracking-[0.22em] text-neutral-500">
                最强一天
              </div>
              <div className="mt-1.5 text-base font-black text-neutral-800 tabular-nums">
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
