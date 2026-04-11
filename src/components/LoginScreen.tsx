import React, { useState } from 'react';
import { JsonIcon } from './icons';

interface LoginScreenProps {
  onJsonInput: (json: string) => void;
  onDemo: () => void;
  loading: boolean;
  error: string | null;
}

export const LoginScreen = React.memo(function LoginScreen({ onJsonInput, onDemo, loading, error }: LoginScreenProps): React.ReactElement {
  const [username, setUsername] = useState('');
  const [jsonInput, setJsonInput] = useState('');

  const normalizedUsername = username.trim();
  const jsonUrl = `https://www.duolingo.com/users/${encodeURIComponent(normalizedUsername || 'YOUR_USERNAME')}`;

  return (
    <div className="min-h-screen bg-surface-background flex items-center justify-center p-3 sm:p-4">
      <div className="bg-surface rounded-[20px] sm:rounded-[28px] shadow-card w-full max-w-lg overflow-hidden border border-neutral-100">
        <div className="p-5 sm:p-8 text-center bg-surface">
          <img src="/duo-owl.svg" alt="Duo" width="96" height="96" className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 animate-bounce" />
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-800 mb-2">DuoDash 仪表盘</h1>
          <p className="text-sm sm:text-base text-neutral-500 mb-6 sm:mb-8 font-medium">输入你的信息以可视化学习数据</p>

          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-button border border-brand-500 bg-brand-100 px-3 sm:px-4 py-1.5 sm:py-2 font-bold text-brand-700 text-xs sm:text-sm">
            <JsonIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            粘贴 JSON (推荐)
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded mb-4 sm:mb-6 text-xs text-left">
              <p className="font-bold mb-1">连接遇到问题：</p>
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            <div className="bg-surface-background p-3 sm:p-4 rounded-card border border-dashed border-neutral-100 text-left space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-neutral-500 font-bold">稳定获取数据步骤：</p>
              <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-[10px] sm:text-xs text-yellow-800 font-bold">
                ⚠️ 必须先在当前浏览器登录 <a href="https://www.duolingo.com" target="_blank" rel="noopener noreferrer" className="underline">duolingo.com</a>
              </div>
              <ol className="list-decimal list-inside text-[10px] sm:text-xs text-neutral-500 space-y-1">
                <li>在下方输入用户名，点击"打开数据页"</li>
                <li>全选 (Ctrl+A) 并复制 (Ctrl+C)</li>
                <li>粘贴到下方文本框</li>
              </ol>
              <div className="flex flex-col sm:flex-row gap-2">
                <input type="text" placeholder="你的用户名" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 bg-surface border border-neutral-100 rounded-button px-3 py-2 text-xs sm:text-sm font-bold text-neutral-800 min-h-[44px] sm:min-h-0" aria-label="用户名" />
                <a href={jsonUrl} target="_blank" rel="noopener noreferrer"
                  className="bg-neutral-100 hover:bg-brand-50 text-neutral-800 text-xs font-bold py-2 px-3 rounded-button flex items-center justify-center min-h-[44px] sm:min-h-0 whitespace-nowrap">打开数据页 ↗</a>
              </div>
            </div>
            <div className="text-left">
              <label htmlFor="json-input" className="block text-neutral-800 font-bold mb-2 ml-1 text-xs sm:text-sm uppercase">粘贴 JSON 数据</label>
              <textarea id="json-input" value={jsonInput} onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-28 sm:h-32 bg-surface-background border border-neutral-100 rounded-card px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:border-[#58cc02] font-mono text-[10px] sm:text-xs text-neutral-800"
                placeholder='{"language_data": {...}}' />
            </div>
            <button onClick={() => onJsonInput(jsonInput)} disabled={loading || !jsonInput}
              className="w-full bg-[#1cb0f6] hover:bg-[#1899d6] text-white font-extrabold py-3 px-4 rounded-button disabled:opacity-50 mt-3 sm:mt-4 shadow-card text-sm sm:text-base min-h-[48px]">
              {loading ? "生成中..." : "生成仪表盘"}
            </button>
          </div>

          <div className="mt-5 sm:mt-6 border-t border-neutral-100 pt-5 sm:pt-6">
            <button onClick={onDemo} disabled={loading} className="text-neutral-400 font-bold text-xs sm:text-sm hover:text-brand-500 uppercase tracking-widest disabled:opacity-50 min-h-[44px]">使用演示数据试玩</button>
          </div>
        </div>
      </div>
    </div>
  );
});
