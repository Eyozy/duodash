import React from 'react';

interface NavbarProps {
  loading: boolean;
  lastUpdated: number | null;
  isStale?: boolean; // 数据是否可能过期（来自缓存）
  onRefresh: () => void;
  onShare?: () => void;
}

function getUpdateStatusText(loading: boolean, lastUpdated: number | null, isStale?: boolean): string {
  if (loading) return '正在更新…';
  if (lastUpdated) {
    const timeStr = new Date(lastUpdated).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    // 检查数据是否超过 30 分钟
    const isOld = Date.now() - lastUpdated > 30 * 60 * 1000;
    if (isStale || isOld) {
      return `缓存数据 (${timeStr})`;
    }
    return `更新于 ${timeStr}`;
  }
  return '尚未更新';
}

export function Navbar({ loading, lastUpdated, isStale, onRefresh, onShare }: NavbarProps): React.ReactElement {
  return (
    <nav className="bg-white border-b-2 border-gray-200 sticky top-0 z-50" aria-label="主导航">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Duo Owl" className="w-8 h-8 rounded-lg" />
            <span className="font-extrabold text-2xl text-[#58cc02] tracking-tight hidden sm:block">DuoDash</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className={`text-xs font-semibold ${isStale ? 'text-amber-600' : 'text-gray-600'}`} aria-live="polite">
                {getUpdateStatusText(loading, lastUpdated, isStale)}
              </span>
            </div>
            {onShare && (
              <button
                onClick={onShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors"
                title="分享卡片"
                aria-label="分享卡片"
              >
                <span className="text-base" role="img" aria-hidden="true">📤</span>
                <span className="hidden sm:inline font-semibold text-gray-700 text-sm">分享</span>
              </button>
            )}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="刷新数据"
              aria-label={loading ? '正在刷新数据' : '刷新数据'}
            >
              <span className={`text-base ${loading ? 'animate-spin' : ''}`} role="img" aria-hidden="true">🔄</span>
              <span className="hidden sm:inline font-semibold text-gray-700 text-sm">刷新</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
