import React, { useState, useEffect, useRef } from 'react';
import type { UserData } from '../types';
import { analyzeUserStats, getAiInfo } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AiCoachProps {
  userData: UserData;
}

export function AiCoach({ userData }: AiCoachProps): React.ReactElement {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiInfo, setAiInfo] = useState({ provider: 'loading...', model: '' });
  const [shouldAutoFetch, setShouldAutoFetch] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!userData || !shouldAutoFetch) return;

    let cancelled = false;

    async function fetchAnalysis(): Promise<void> {
      if (cancelled) return;
      setLoading(true);
      const [result, info] = await Promise.all([
        analyzeUserStats(userData),
        getAiInfo()
      ]);
      if (!cancelled) {
        setAnalysis(result);
        setAiInfo(info);
        setLoading(false);
      }
    }

    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
    const cic = (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback;

    if (ric) {
      const idleId = ric(() => void fetchAnalysis(), { timeout: 1500 });
      return () => {
        cancelled = true;
        cic?.(idleId);
      };
    }

    const timerId = window.setTimeout(() => void fetchAnalysis(), 300);
    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [userData, shouldAutoFetch]);

  useEffect(() => {
    if (shouldAutoFetch) return;
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some(e => e.isIntersecting)) {
          setShouldAutoFetch(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldAutoFetch]);

  return (
    <div ref={rootRef} className="bg-white rounded-2xl shadow-sm border-2 border-b-4 border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="bg-[#58cc02] p-4 flex items-center justify-between">
        <h2 className="text-white font-extrabold text-lg flex items-center gap-2">
          <span className="text-2xl">🦉</span> Duo 老师的点评
        </h2>
        {loading && <span className="text-white text-sm font-bold animate-pulse">Duo 正在磨刀...</span>}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start gap-4">
          <div className="hidden sm:block flex-shrink-0">
            <img
              src="https://design.duolingo.com/28e4b3aebfae83e5ff2f.svg"
              alt="Duo"
              width="64"
              height="64"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className={`w-16 h-16 ${loading ? 'animate-bounce' : ''}`}
            />
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="prose prose-sm prose-p:text-gray-600 prose-headings:text-gray-700 min-h-[96px]">
                <ReactMarkdown>{analysis || "暂无分析。"}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        <div className="mt-auto pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="text-xs text-gray-600 font-bold order-2 sm:order-1">
            {aiInfo.provider}: {aiInfo.model}
          </div>
          <button
            onClick={() => {
              setLoading(true);
              analyzeUserStats(userData)
                .then(result => {
                  setAnalysis(result);
                })
                .catch(() => {
                  setAnalysis("刷新失败，请稍后重试。");
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-2 bg-[#1cb0f6] hover:bg-[#1899d6] text-white font-bold py-2 px-4 rounded-xl border-b-4 border-[#1480b3] active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 text-sm"
          >
            {loading ? '思考中...' : '刷新点评'}
          </button>
        </div>
      </div>
    </div>
  );
};
