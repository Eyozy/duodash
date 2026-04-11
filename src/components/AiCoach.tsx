import React, { useState, useEffect, useRef } from 'react';
import type { UserData } from '../types';
import { analyzeUserStats, getAiInfo } from '../services/aiService';
import ReactMarkdown from 'react-markdown';
import { CoachIcon, RefreshIcon } from './icons';
import { useIntersectionTrigger } from '../hooks/useIntersectionTrigger';

interface AiCoachProps {
  userData: UserData;
}

interface AiInfoState {
  provider: string;
  model: string;
}

const EMPTY_AI_INFO: AiInfoState = { provider: '', model: '' };

function getWeeklyXp(userData: UserData): number {
  if (userData.weeklyXpHistory?.length) {
    return userData.weeklyXpHistory.reduce((sum, day) => sum + (day.isFuture ? 0 : day.xp), 0);
  }
  return userData.dailyXpHistory.reduce((sum, day) => sum + day.xp, 0);
}

function getWeeklyStudyDays(userData: UserData): number {
  if (userData.weeklyXpHistory?.length) {
    return userData.weeklyXpHistory.filter((day) => !day.isFuture && day.xp > 0).length;
  }
  return userData.dailyXpHistory.filter((day) => day.xp > 0).length;
}

function buildLocalAnalysis(userData: UserData): string {
  const weeklyXp = getWeeklyXp(userData);
  const studyDays = getWeeklyStudyDays(userData);
  const streakLine = userData.streak >= 365
    ? `你这条 ${userData.streak} 天连胜线已经稳得离谱。`
    : `你已经连续学习 ${userData.streak} 天，节奏很稳。`;
  const paceLine = `${userData.learningLanguage} 这门课最近 7 天拿下 ${weeklyXp.toLocaleString()} XP，${studyDays} 天都有学习记录。`;
  const nextLine = userData.xpToday && userData.xpToday > 0
    ? `今天也已经推进了 ${userData.xpToday} XP，继续保持就行。`
    : '今天还可以顺手补一课，把节奏续上。';

  return [streakLine, paceLine, nextLine].join(' ');
}

function isUnavailableAnalysis(message: string): boolean {
  return message.startsWith('咕咕！未配置 AI API Key')
    || message.startsWith('咕咕！连接')
    || message === 'AI 返回了空内容。';
}

export function AiCoach({ userData }: AiCoachProps): React.ReactElement {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiInfo, setAiInfo] = useState<AiInfoState>(EMPTY_AI_INFO);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const aiInfoCacheRef = useRef<AiInfoState | null>(null);
  const shouldAutoFetch = useIntersectionTrigger(rootRef);

  function resetRemoteAnalysis(): void {
    setAnalysis(null);
    setAiInfo(EMPTY_AI_INFO);
  }

  function applyRemoteAnalysis(result: string, info?: AiInfoState): void {
    if (isUnavailableAnalysis(result)) {
      resetRemoteAnalysis();
      return;
    }

    setAnalysis(result);
    if (info) {
      setAiInfo(info);
      aiInfoCacheRef.current = info;
    }
  }

  async function loadRemoteAnalysis(isCancelled: () => boolean, refreshInfo = false): Promise<void> {
    if (isCancelled()) return;
    setLoading(true);
    try {
      const result = await analyzeUserStats(userData);
      if (isCancelled()) return;

      let info = !refreshInfo ? aiInfoCacheRef.current : null;
      if (!info && !isUnavailableAnalysis(result)) {
        try {
          info = await getAiInfo();
        } catch {
          info = null;
        }
      }

      if (!isCancelled()) {
        applyRemoteAnalysis(result, info ?? undefined);
      }
    } catch {
      if (!isCancelled()) {
        resetRemoteAnalysis();
      }
    } finally {
      if (!isCancelled()) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    resetRemoteAnalysis();
  }, [userData]);

  useEffect(() => {
    if (!userData || !shouldAutoFetch) return;

    let cancelled = false;

    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;

    if (ric) {
      const idleId = ric(() => void loadRemoteAnalysis(() => cancelled), { timeout: 1500 });
      return () => {
        cancelled = true;
        cic?.(idleId);
      };
    }

    const timerId = window.setTimeout(() => void loadRemoteAnalysis(() => cancelled), 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [userData, shouldAutoFetch]);

  const displayedAnalysis = analysis ?? buildLocalAnalysis(userData);

  function handleRefresh(): void {
    void loadRemoteAnalysis(() => false, true);
  }

  return (
    <div ref={rootRef} className="panel-card animate-fade-in-up flex h-full flex-col overflow-hidden">
      <div className="panel-header">
        <h2 className="panel-title">
          <CoachIcon className="panel-title-icon h-5 w-5" />
          <span className="leading-none">Duo 老师的点评</span>
        </h2>
        {loading && <span className="ml-auto text-brand-500 text-xs sm:text-sm font-bold animate-pulse">Duo 正在磨刀...</span>}
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="hidden sm:block flex-shrink-0">
            <img
              src="https://design.duolingo.com/28e4b3aebfae83e5ff2f.svg"
              alt="Duo"
              width="64"
              height="64"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className={`w-12 h-12 sm:w-16 sm:h-16 ${loading ? 'animate-bounce' : ''}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-2 sm:space-y-3 animate-pulse">
                <div className="h-3 sm:h-4 bg-neutral-100 rounded w-3/4"></div>
                <div className="h-3 sm:h-4 bg-neutral-100 rounded w-full"></div>
                <div className="h-3 sm:h-4 bg-neutral-100 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="prose prose-sm prose-p:text-neutral-500 prose-headings:text-neutral-800 min-h-[80px] sm:min-h-[96px] text-sm sm:text-base">
                <ReactMarkdown>{displayedAnalysis}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        {(analysis || loading) && (
          <div className="mt-auto pt-4 sm:pt-6 flex flex-row justify-between items-center gap-3">
            {aiInfo.model && (
              <div className="text-[10px] sm:text-xs text-neutral-500 font-bold">
                {aiInfo.provider}: {aiInfo.model}
              </div>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="ml-auto rounded-button bg-[#1cb0f6] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-card transition-all hover:bg-[#1899d6] disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-2">
                <RefreshIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? '思考中...' : '刷新点评'}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
