import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import type { UserData } from '../../types';
import { MilestoneCard, WeeklySummaryCard } from './cards';
import { useSnapdom } from './useSnapdom';
import { DownloadImageIcon, MilestoneXpIcon, ShareIcon, StreakCardIcon, WeeklyReportIcon } from '../icons';
import { formatMonthDay, formatDuration, getMonday } from '../../utils/dateUtils';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
}

type CardType = 'milestone-streak' | 'milestone-xp' | 'weekly';

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

const CARD_OPTIONS: { type: CardType; label: string; icon: React.ReactNode }[] = [
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
  const activeStreak = completedDays.reduce(
    (streak, day) => (day.xp > 0 ? streak + 1 : 0),
    0
  );
  const totalTime = formatDuration(totalMinutes);
  const monday = getMonday(now);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    daysLearned,
    activeStreak,
    completionRate,
    averageXp,
    bestDayLabel: bestDay.date,
    bestDayXp: bestDay.xp,
    totalXp,
    totalTime,
    dateRange: `${formatMonthDay(monday)} - ${formatMonthDay(sunday)}`,
  };
}

export function ShareModal({ isOpen, onClose, userData }: ShareModalProps): React.ReactElement | null {
  const [selectedCard, setSelectedCard] = useState<CardType>('milestone-streak');
  const cardRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { isExporting, exportToPng } = useSnapdom();

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
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
        className="w-full max-w-lg overflow-y-auto rounded-[20px] sm:rounded-[28px] border border-neutral-100 bg-surface shadow-tooltip max-h-[90vh]"
        style={{ scrollbarWidth: 'none' }}
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
        <div className="p-4 sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 id="share-modal-title" className="flex items-center gap-2 text-lg sm:text-xl font-black text-neutral-800">
                <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5 text-brand-500" /> 分享卡片
              </h2>
              <p className="mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-neutral-500">
                选一张最能代表你这段学习进展的卡片。
              </p>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-button border border-neutral-100 text-neutral-400 transition-colors duration-200 hover:bg-brand-50 hover:text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2"
              aria-label="关闭"
            >
              <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="mb-4 flex flex-row flex-wrap gap-2">
            {CARD_OPTIONS.map(opt => (
              <button
                key={opt.type}
                onClick={() => setSelectedCard(opt.type)}
                className={`flex flex-1 min-w-0 flex-row items-center justify-center gap-2 rounded-button border px-3 py-2.5 sm:px-4 text-xs sm:text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 ${
                  selectedCard === opt.type
                    ? 'border-brand-500 bg-brand-100 text-brand-700 shadow-sm'
                    : 'border-neutral-100 bg-surface text-neutral-800 hover:bg-brand-50 hover:border-brand-100'
                }`}
              >
                <span className="shrink-0">{opt.icon}</span>
                <span className="whitespace-nowrap leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <div className="mx-auto w-full max-w-[300px] sm:max-w-[332px] md:max-w-[344px]">
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
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-button bg-[#58cc02] px-4 py-3 sm:py-3.5 font-bold text-white shadow-card transition-all duration-200 hover:bg-[#46a302] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-sm sm:text-base min-h-[48px]"
            aria-label={isExporting ? '导出图片中' : '下载图片'}
          >
            {isExporting ? (
              <>
                <svg className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                导出中...
              </>
            ) : (
              <>
                <DownloadImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                下载图片
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
