import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { UserData } from '../../types';
import { MilestoneCard, WeeklySummaryCard } from './cards';
import { useSnapdom } from './useSnapdom';
import { DownloadImageIcon, MilestoneXpIcon, ShareIcon, StreakCardIcon, WeeklyReportIcon } from '../icons';
import { formatMonthDayInTimeZone, formatDuration, getMonday } from '../../utils/dateUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
}

type CardType = 'milestone-streak' | 'milestone-xp' | 'weekly';

export interface WeeklySummaryData {
  daysLearned: number;
  completionRate: number;
  averageXp: number;
  bestDayLabel: string;
  bestDayXp: number;
  totalXp: number;
  totalTime: string;
  dateRange: string;
}

const CARD_OPTIONS: { type: CardType; label: string; icon: ReactNode }[] = [
  {
    type: 'milestone-streak',
    label: '连胜成就',
    icon: <StreakCardIcon className="w-4 h-4" />,
  },
  {
    type: 'milestone-xp',
    label: '经验突破',
    icon: <MilestoneXpIcon className="w-4 h-4" />,
  },
  {
    type: 'weekly',
    label: '本周报告',
    icon: <WeeklyReportIcon className="w-4 h-4" />,
  },
];

function getCardExportName(cardType: CardType): string {
  switch (cardType) {
    case 'milestone-streak':
      return 'duodash-streak';
    case 'milestone-xp':
      return 'duodash-xp';
    case 'weekly':
      return 'duodash-weekly';
  }
}

function buildWeeklySummaryData(userData: UserData, now = new Date()): WeeklySummaryData {
  const weeklyXp = userData.weeklyXpHistory || [];
  const weeklyTime = userData.weeklyTimeHistory || [];
  const completedDays = weeklyXp.filter(day => !day.isFuture);
  const totalXp = completedDays.reduce((sum, day) => sum + day.xp, 0);
  const daysLearned = completedDays.filter(day => day.xp > 0).length;
  const totalMinutes = weeklyTime.reduce((sum, day) => sum + (day.isFuture ? 0 : day.time), 0);
  const averageXp = daysLearned > 0 ? Math.round(totalXp / daysLearned) : 0;
  const completionRate = completedDays.length > 0 ? Math.round((daysLearned / completedDays.length) * 100) : 0;
  const bestDay = completedDays.reduce(
    (best, day) => (day.xp > best.xp ? day : best),
    { date: '—', xp: 0, isFuture: false }
  );
  const totalTime = formatDuration(totalMinutes);
  const monday = getMonday(now);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    daysLearned,
    completionRate,
    averageXp,
    bestDayLabel: bestDay.date,
    bestDayXp: bestDay.xp,
    totalXp,
    totalTime,
    dateRange: `${formatMonthDayInTimeZone(monday)} - ${formatMonthDayInTimeZone(sunday)}`,
  };
}

export function ShareModal({ isOpen, onClose, userData }: ShareModalProps): ReactElement | null {
  const [selectedCard, setSelectedCard] = useState<CardType>('milestone-streak');
  const cardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { isExporting, exportToPng } = useSnapdom();

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();

    const originalOverflow = document.body.style.overflow;
    const originalOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.overscrollBehavior = originalOverscroll;
    };
  }, [isOpen]);

  const weeklyData = useMemo(() =>
    selectedCard === 'weekly' ? buildWeeklySummaryData(userData) : null,
    [selectedCard, userData]
  );

  const handleExport = useCallback(async () => {
    if (!cardRef.current) return;
    await exportToPng(cardRef.current, { filename: getCardExportName(selectedCard), scale: 3 });
  }, [selectedCard, exportToPng]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[12px] border border-neutral-100 bg-surface shadow-tooltip"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onClose();
          }
        }}
      >
        <div className="p-3 min-[400px]:p-4 sm:p-5">
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="share-modal-title" className="flex items-center gap-2 text-lg sm:text-xl font-black text-neutral-800">
                <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500" /> 分享卡片
              </h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-button border border-neutral-100 text-neutral-400 transition-colors duration-200 hover:bg-brand-50 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
                aria-label="关闭"
              >
                <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm leading-5 sm:leading-6 text-neutral-500">
              选一张最能代表你这段学习进展的卡片。
            </p>
          </div>

          <div className="mb-3 sm:mb-4 flex flex-row flex-wrap gap-2">
            {CARD_OPTIONS.map(opt => (
              <button
                key={opt.type}
                onClick={() => setSelectedCard(opt.type)}
                className={`flex flex-1 min-w-0 flex-row items-center justify-center gap-1 min-[375px]:gap-1.5 sm:gap-2 rounded-button border px-1.5 min-[375px]:px-2.5 sm:px-4 py-2 sm:py-2.5 text-[10px] min-[375px]:text-xs sm:text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 ${selectedCard === opt.type
                    ? 'border-brand-500 bg-brand-100 text-brand-700 shadow-sm'
                    : 'border-neutral-100 bg-surface text-neutral-800 hover:bg-brand-50 hover:border-brand-100'
                  }`}
              >
                <span className="shrink-0">{opt.icon}</span>
                <span className="whitespace-nowrap leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="relative mb-3 sm:mb-4 h-[292px] min-[375px]:h-[344px] min-[425px]:h-[378px] sm:h-[430px] py-1">
            <div className="pointer-events-none absolute left-1/2 top-1/2 w-[344px] h-[430px] shrink-0 -translate-x-1/2 -translate-y-1/2 scale-[0.68] min-[375px]:scale-[0.8] min-[425px]:scale-[0.88] sm:scale-100">
              {selectedCard === 'milestone-streak' && (
                <MilestoneCard ref={cardRef} type="streak" value={userData.streak} accountAgeDays={userData.accountAgeDays} />
              )}
              {selectedCard === 'milestone-xp' && (
                <MilestoneCard ref={cardRef} type="xp" value={userData.totalXp} accountAgeDays={userData.accountAgeDays} />
              )}
              {selectedCard === 'weekly' && weeklyData && (
                <WeeklySummaryCard ref={cardRef} summary={weeklyData} />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="relative z-10 block w-full rounded-button bg-[#58cc02] px-4 py-3 text-sm font-bold text-white shadow-card transition-colors duration-200 hover:bg-[#46a302] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:py-3.5 sm:text-base min-h-[48px]"
            aria-label={isExporting ? '导出图片中' : '下载图片'}
          >
            {isExporting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                导出中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <DownloadImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                下载图片
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
