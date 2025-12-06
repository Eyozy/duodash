import React, { useState, useEffect } from 'react';
import type { UserData } from '../types';
import { analyzeUserStats } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface AiCoachProps {
  userData: UserData;
}

export const AiCoach: React.FC<AiCoachProps> = ({ userData }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      const result = await analyzeUserStats(userData);
      setAnalysis(result);
      setLoading(false);
    };
    if (userData) fetchAnalysis();
  }, [userData.streak, userData.totalXp, userData.username]);

  const providerName = import.meta.env.AI_PROVIDER || 'gemini';
  const modelName = import.meta.env.AI_MODEL || 'gemini-2.5-flash';

  return (
    <div className="bg-white rounded-2xl shadow-sm border-2 border-b-4 border-gray-200 overflow-hidden h-full flex flex-col">
      <div className="bg-[#58cc02] p-4 flex items-center justify-between">
        <h2 className="text-white font-extrabold text-lg flex items-center gap-2">
          <span className="text-2xl">🦉</span> Duo 老师的点评
        </h2>
        {loading && <span className="text-white text-sm font-bold animate-pulse">Duo 正在磨刀...</span>}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-start gap-4">
          <div className="hidden sm:block flex-shrink-0">
            <img src="https://design.duolingo.com/28e4b3aebfae83e5ff2f.svg" alt="Duo" className={`w-16 h-16 ${loading ? 'animate-bounce' : ''}`} />
          </div>
          <div className="flex-1">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ) : (
              <div className="prose prose-sm prose-p:text-gray-600 prose-headings:text-gray-700">
                <ReactMarkdown>{analysis || "暂无分析。"}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        <div className="mt-auto pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="text-xs text-gray-400 font-bold order-2 sm:order-1">
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
