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
    icon: <StreakCardIcon className="h-9 w-9 text-brand-500" />,
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
    radialGradient: 'rgba(88, 204, 2, 0.18)',
  },
  xp: {
    icon: <MilestoneXpIcon className="h-9 w-9 text-status-info" />,
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
    radialGradient: 'rgba(28,176,246,0.18)',
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
      radialGradient,
    } = CONFIG[type];

    const displayDate = date || new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' });

    const displayInsightValue = type === 'xp' && accountAgeDays
      ? `${Math.round(value / accountAgeDays)} XP`
      : insightValue;

    return (
      <div
        ref={ref}
        className={`pointer-events-none relative mx-auto flex w-[344px] h-[430px] flex-col overflow-hidden rounded-[14px] border border-slate-200 bg-gradient-to-b shadow-lg ${surfaceClass}`}
      >
        {/* Top-right color gradient */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(circle at top right, ${radialGradient}, transparent 32%)` }}
        />
        <div className="pointer-events-none absolute -right-10 top-16 h-36 w-36 rounded-full bg-white/55 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-40 w-full bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.45))]" />

        <div className="relative z-10 flex w-full h-full flex-col justify-center p-5">
          {/* Top Badge and Date */}
          <div className="flex items-start justify-between gap-3">
            <div className={`inline-flex items-center rounded-pill border px-3 py-1 text-xs font-bold ${badgeClass}`}>
              {badge}
            </div>
            <div className="text-right text-xs font-semibold text-neutral-500">
              {displayDate}
            </div>
          </div>

          {/* Header Content */}
          <div className="mt-4 flex flex-col items-start gap-3 text-left">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border shadow-sm ${iconWrapClass}`}>
              {icon}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold tracking-[0.24em] text-neutral-500">
                {eyebrow}
              </div>
              <div className={`mt-1 text-[1.8rem] font-black tracking-tight ${accentClass}`}>
                {label}
              </div>
            </div>
          </div>

          {/* Middle Numeric/Summary Card */}
          <div data-export-card="inner" className="mt-4 rounded-[10px] border border-slate-200/80 bg-white/88 px-4 py-3.5 backdrop-blur-sm">
            <div className="flex items-end gap-2">
              <span className={`text-[2.8rem] font-black leading-none tracking-[-0.04em] tabular-nums ${valueClass}`}>
                {value.toLocaleString()}
              </span>
              <span className="pb-1 text-sm font-bold text-neutral-500">
                {unit}
              </span>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-neutral-700">
              {summary}
            </p>
          </div>

          {/* Bottom Card */}
          <div className="mt-4">
            <div data-export-card="inner" className="rounded-[8px] border border-slate-200/80 bg-white/92 px-4 py-3.5">
              <div className="text-[11px] font-bold tracking-[0.22em] text-neutral-500">
                {insightLabel}
              </div>
              <div className="mt-1.5 text-[15px] font-black text-neutral-800 tabular-nums">
                {displayInsightValue || '每天坚持'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MilestoneCard.displayName = 'MilestoneCard';
