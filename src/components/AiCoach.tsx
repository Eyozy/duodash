import React, { useState, useEffect } from 'react';
import type { UserData } from '../types';
import { analyzeUserStats, getAiInfo } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AiCoachProps {
  userData: UserData;
}

export const AiCoach: React.FC<AiCoachProps> = ({ userData }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiInfo, setAiInfo] = useState({ provider: 'loading...', model: '' });
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const [shouldAutoFetch, setShouldAutoFetch] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const result = await analyzeUserStats(userData);
      setAnalysis(result);
      const info = await getAiInfo();
      setAiInfo(info);
      setLoading(false);
    };

    if (!userData) return;
    if (!shouldAutoFetch) return;

    let cancelled = false;
    const run = async () => {
      if (cancelled) return;
      await fetchAnalysis();
    };

    // 避免占用首屏主线程：可用则在空闲时执行
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: { timeout: number }) => number);
    const cic = (window as any).cancelIdleCallback as undefined | ((id: number) => void);
    let idleId: number | null = null;

    if (ric) {
      idleId = ric(() => { void run(); }, { timeout: 1500 });
    } else {
      const t = window.setTimeout(() => { void run(); }, 300);
      return () => {
        cancelled = true;
        window.clearTimeout(t);
      };
    }

    return () => {
      cancelled = true;
      if (idleId !== null && cic) cic(idleId);
    };
  }, [userData, shouldAutoFetch]);

  useEffect(() => {
    if (shouldAutoFetch) return;
    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) {
        setShouldAutoFetch(true);
        observer.disconnect();
      }
    }, { rootMargin: '200px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldAutoFetch]);

  const providerName = aiInfo.provider;
  const modelName = aiInfo.model;

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
            {providerName}: {modelName}
          </div>
          <button
            onClick={async () => {
              setLoading(true);
              const result = await analyzeUserStats(userData);
              setAnalysis(result);
              setLoading(false);
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
