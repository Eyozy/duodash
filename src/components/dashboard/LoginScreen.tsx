import React, { useState, useCallback } from 'react';

interface LoginScreenProps {
  onDemo: () => void;
  error: string | null;
}

const JWT_COMMAND = `document.cookie.match(/jwt_token=([^;]+)/)[1]`;
const CP_COMMAND = 'cp .env.example .env.local';
const README_URL = 'https://github.com/eyozy/duodash/blob/main/README.md';

function useCopyAction(text: string): [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return [copied, copy];
}

export const LoginScreen = React.memo(function LoginScreen({ onDemo, error }: LoginScreenProps): React.ReactElement {
  const [copiedCp, handleCopyCp] = useCopyAction(CP_COMMAND);
  const [copiedJwt, handleCopyJwt] = useCopyAction(JWT_COMMAND);

  return (
    <div className="flex-1 bg-surface-background grid place-items-center px-4">
      <div className="w-full max-w-md animate-fade-in-up">

        <div className="text-center mb-6">
          <img src="/favicon.svg" alt="DuoDash" className="w-14 h-14 mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-neutral-800 tracking-tight">DuoDash</h1>
          <p className="text-neutral-500 text-xs mt-1">未检测到 Duolingo 账号配置，请完成以下步骤</p>
        </div>

        <div className="panel-card p-5 shadow-card mb-5">
          <h2 className="text-sm font-extrabold text-neutral-800 mb-4 pb-2 border-b border-neutral-100 flex items-center gap-1.5">
            <span className="w-1.5 h-3 bg-brand-500 rounded-sm"></span>
            配置 Duolingo 账号
          </h2>

          <ul className="space-y-4 text-xs sm:text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <span className="font-bold text-brand-500 mt-0.5 flex-shrink-0">1.</span>
              <div className="flex-1">
                登录 <a href="https://www.duolingo.com" target="_blank" rel="noopener noreferrer" className="text-brand-500 font-bold hover:underline">duolingo.com</a>，在浏览器控制台（F12）执行以下命令获取 JWT Token：
                <div className="mt-2">
                  <button onClick={handleCopyJwt} className="bg-brand-100 hover:bg-brand-200 text-brand-700 text-xs font-bold py-1.5 px-3 rounded-button transition-colors cursor-pointer">
                    {copiedJwt ? '已复制获取命令' : '复制获取命令'}
                  </button>
                </div>
              </div>
            </li>

            <li className="flex items-start gap-2">
              <span className="font-bold text-brand-500 mt-0.5 flex-shrink-0">2.</span>
              <div className="flex-1">
                编辑 <code className="bg-neutral-100 text-neutral-800 px-1 rounded font-mono text-xs">.env.local</code>，填入 <code className="font-mono text-xs">DUOLINGO_USERNAME</code> 和 <code className="font-mono text-xs">DUOLINGO_JWT</code>，详见 <a href={README_URL} target="_blank" rel="noopener noreferrer" className="text-brand-500 font-bold hover:underline">README</a>。
              </div>
            </li>

            <li className="flex items-start gap-2">
              <span className="font-bold text-brand-500 mt-0.5 flex-shrink-0">3.</span>
              <div className="flex-1">
                重启服务：运行 <code className="bg-neutral-100 text-neutral-800 px-1 rounded font-mono text-xs">npm run dev</code>，系统即可自动加载数据。
              </div>
            </li>
          </ul>

          <div className="mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-400">
            如尚未创建配置文件，先执行
            <button onClick={handleCopyCp} className="font-mono text-neutral-500 hover:text-brand-600 font-bold ml-1 transition-colors cursor-pointer">
              {copiedCp ? '已复制' : 'cp .env.example .env.local'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-2.5 rounded-button mb-4 text-xs text-center">
            {error}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onDemo}
            className="bg-brand-100 hover:bg-brand-50 text-brand-700 border border-brand-500 rounded-pill px-5 py-2.5 text-xs font-extrabold transition-all shadow-sm cursor-pointer"
          >
            预览演示数据
          </button>
        </div>

      </div>
    </div>
  );
});

