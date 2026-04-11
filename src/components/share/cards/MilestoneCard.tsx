import { forwardRef } from 'react';
import { MilestoneXpIcon, StreakCardIcon } from '../../icons';

interface MilestoneCardProps {
  type: 'streak' | 'xp';
  value: number;
  date?: string;
  accountAgeDays?: number;
}

const CONFIG = {
  streak: {
    icon: <StreakCardIcon className="h-8 w-8 text-brand-500 sm:h-9 sm:w-9" />,
    badge: '连胜里程碑',
    label: '连续打卡',
    eyebrow: '学习习惯',
    summary: '你已经把学习变成每天都会发生的小事。',
    insightLabel: '学习节奏',
    insightValue: '每天坚持',
    unit: '天',
    accentClass: 'text-brand-600',
    valueClass: 'text-brand-500',
    badgeClass: 'border-brand-100 bg-brand-50 text-brand-600',
    iconWrapClass: 'bg-brand-50 border-brand-100',
    surfaceClass: 'from-brand-50 via-white to-white',
  },
  xp: {
    icon: <MilestoneXpIcon className="h-8 w-8 text-status-info sm:h-9 sm:w-9" />,
    badge: '经验里程碑',
    label: '总经验值',
    eyebrow: '成长轨迹',
    summary: '每一次练习都在把长期积累变得更清晰。',
    insightLabel: '平均每天',
    insightValue: undefined,
    unit: 'XP',
    accentClass: 'text-status-info',
    valueClass: 'text-status-info',
    badgeClass: 'border-status-info bg-status-info-bg text-status-info',
    iconWrapClass: 'bg-status-info-bg border-status-info',
    surfaceClass: 'from-status-info-bg via-white to-white',
  },
} as const;

export const MilestoneCard = forwardRef<HTMLDivElement, MilestoneCardProps>(
  ({ type, value, date, accountAgeDays }, ref) => {
    const {
      icon,
      badge,
      label,
      eyebrow,
      summary,
      insightLabel,
      insightValue,
      unit,
      accentClass,
      valueClass,
      badgeClass,
      iconWrapClass,
      surfaceClass,
    } = CONFIG[type];

    const displayDate = date || new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' });

    const displayInsightValue = type === 'xp' && accountAgeDays
      ? `${Math.round(value / accountAgeDays)} XP`
      : insightValue;

    return (
      <div
        ref={ref}
        className={`panel-card relative mx-auto flex aspect-[4/5] w-full max-w-[340px] sm:max-w-[360px] flex-col overflow-hidden rounded-[24px] sm:rounded-[28px] border-[2.5px] sm:border-[3px] border-slate-300 bg-gradient-to-b p-4 sm:p-5 shadow-[0_12px_48px_rgba(15,23,42,0.18)] ${surfaceClass}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.92),transparent_32%)]" />
        <div className="pointer-events-none absolute -right-10 top-16 h-36 w-36 rounded-full bg-white/55 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.45))]" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className={`inline-flex items-center rounded-pill border px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold ${badgeClass}`}>
              {badge}
            </div>
            <div className="text-right text-[10px] sm:text-xs font-semibold text-neutral-500">
              {displayDate}
            </div>
          </div>

          <div className="mt-3 sm:mt-4 flex flex-col items-start gap-2.5 sm:gap-3 text-left">
            <div className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-[14px] sm:rounded-[16px] border shadow-sm ${iconWrapClass}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-xs font-bold tracking-[0.22em] sm:tracking-[0.24em] text-neutral-500">
                {eyebrow}
              </div>
              <div className={`mt-1 text-[1.6rem] sm:text-[1.75rem] md:text-[1.95rem] font-black tracking-tight ${accentClass}`}>
                {label}
              </div>
            </div>
          </div>

          <div data-export-card="inner" className="mt-3 sm:mt-4 rounded-[20px] sm:rounded-[24px] border border-slate-200/80 bg-white/88 px-3.5 sm:px-4 py-3 sm:py-3.5 backdrop-blur-sm">
            <div className="flex items-end gap-1.5 sm:gap-2">
              <span className={`text-[2.5rem] sm:text-[2.8rem] md:text-[3rem] font-black leading-none tracking-[-0.04em] tabular-nums ${valueClass}`}>
                {value.toLocaleString()}
              </span>
              <span className="pb-0.5 sm:pb-1 text-xs sm:text-sm font-bold text-neutral-500">
                {unit}
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-[13px] leading-5 text-neutral-700">
              {summary}
            </p>
          </div>

          <div data-export-card="inner" className="mt-3 sm:mt-4 rounded-[18px] sm:rounded-[20px] border border-slate-200/80 bg-white/92 px-3.5 sm:px-4 py-3 sm:py-3.5">
            <div className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] sm:tracking-[0.22em] text-neutral-500">
              {insightLabel}
            </div>
            <div className="mt-1.5 text-sm sm:text-[15px] md:text-base font-black text-neutral-800">
              {displayInsightValue}
            </div>
          </div>

        </div>
      </div>
    );
  }
);

MilestoneCard.displayName = 'MilestoneCard';
