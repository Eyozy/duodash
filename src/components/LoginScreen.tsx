import React, { useState } from 'react';

interface LoginScreenProps {
  onConnect: (username: string, jwt: string) => void;
  onJsonInput: (json: string) => void;
  onDemo: () => void;
  loading: boolean;
  error: string | null;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onConnect, onJsonInput, onDemo, loading, error }) => {
  const [username, setUsername] = useState('');
  const [jwt, setJwt] = useState('');
  const [mode, setMode] = useState<'creds' | 'json'>('json');
  const [jsonInput, setJsonInput] = useState('');

  const getJsonUrl = () => `https://www.duolingo.com/users/${username.trim() || 'YOUR_USERNAME'}`;

  return (
    <div className="min-h-screen bg-[#235390] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border-2 border-b-4 border-gray-200">
        <div className="p-8 text-center bg-white">
          <img src="https://design.duolingo.com/28e4b3aebfae83e5ff2f.svg" alt="Duo" className="w-24 h-24 mx-auto mb-6 animate-bounce" />
          <h1 className="text-3xl font-extrabold text-gray-700 mb-2">DuoDash 仪表盘</h1>
          <p className="text-gray-500 mb-8 font-medium">输入你的信息以可视化学习数据</p>

          <div className="flex justify-center gap-4 mb-6">
            <button onClick={() => setMode('json')} className={`px-4 py-2 rounded-xl font-bold transition-all ${mode === 'json' ? 'bg-[#58cc02] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>粘贴 JSON (推荐)</button>
            <button onClick={() => setMode('creds')} className={`px-4 py-2 rounded-xl font-bold transition-all ${mode === 'creds' ? 'bg-[#58cc02] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>自动连接 (Beta)</button>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-xs text-left">
              <p className="font-bold mb-1">连接遇到问题：</p>
              <p>{error}</p>
            </div>
          )}

          {mode === 'creds' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 text-left">
                <strong>技术说明：</strong> 此功能尝试直接连接多邻国 API，可能因 CORS 限制失败。
              </div>
              <div className="text-left">
                <label className="block text-gray-700 font-bold mb-2 ml-1 text-sm uppercase">用户名</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#58cc02] font-bold text-gray-700" placeholder="例如：SteveThePolyglot" />
              </div>
              <div className="text-left">
                <label className="block text-gray-700 font-bold mb-2 ml-1 text-sm uppercase">JWT Token (可选)</label>
                <input type="password" value={jwt} onChange={(e) => setJwt(e.target.value)}
                  className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#58cc02] font-bold text-gray-700" placeholder="如果为空，将尝试获取公开数据" />
              </div>
              <button onClick={() => onConnect(username, jwt)} disabled={loading || !username}
                className="w-full bg-[#1cb0f6] hover:bg-[#1899d6] text-white font-extrabold py-3 px-4 rounded-xl border-b-4 border-[#1480b3] disabled:opacity-50 mt-4">
                {loading ? "正在尝试连接..." : "尝试连接"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300 text-left space-y-3">
                <p className="text-sm text-gray-600 font-bold">稳定获取数据步骤：</p>
                <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs text-yellow-800 font-bold">
                  ⚠️ 必须先在当前浏览器登录 <a href="https://www.duolingo.com" target="_blank" className="underline">duolingo.com</a>
                </div>
                <ol className="list-decimal list-inside text-xs text-gray-500 space-y-1">
                  <li>在下方输入用户名，点击"打开数据页"</li>
                  <li>全选 (Ctrl+A) 并复制 (Ctrl+C)</li>
                  <li>粘贴到下方文本框</li>
                </ol>
                <div className="flex gap-2">
                  <input type="text" placeholder="你的用户名" value={username} onChange={(e) => setUsername(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold text-gray-700" />
                  <a href={getJsonUrl()} target="_blank" rel="noopener noreferrer"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold py-2 px-3 rounded-lg flex items-center">打开数据页 ↗</a>
                </div>
              </div>
              <div className="text-left">
                <label className="block text-gray-700 font-bold mb-2 ml-1 text-sm uppercase">粘贴 JSON 数据</label>
                <textarea value={jsonInput} onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-32 bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#58cc02] font-mono text-xs text-gray-700"
                  placeholder='{"language_data": {...}}' />
              </div>
              <button onClick={() => onJsonInput(jsonInput)} disabled={!jsonInput}
                className="w-full bg-[#1cb0f6] hover:bg-[#1899d6] text-white font-extrabold py-3 px-4 rounded-xl border-b-4 border-[#1480b3] disabled:opacity-50 mt-4">
                生成仪表盘
              </button>
            </div>
          )}

          <div className="mt-6 border-t-2 border-gray-100 pt-6">
            <button onClick={onDemo} className="text-gray-400 font-bold text-sm hover:text-gray-600 uppercase tracking-widest">使用演示数据试玩</button>
          </div>
        </div>
      </div>
    </div>
  );
};
