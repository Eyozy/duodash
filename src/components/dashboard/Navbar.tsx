import React from 'react';

interface NavbarProps {
  loading: boolean;
  lastUpdated: number | null;
  onRefresh: () => void;
}

function getUpdateStatusText(loading: boolean, lastUpdated: number | null): string {
  if (loading) return '正在更新…';
  if (lastUpdated) {
    return `更新于 ${new Date(lastUpdated).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return '尚未更新';
}

export function Navbar({ loading, lastUpdated, onRefresh }: NavbarProps): React.ReactElement {
  return (
    <nav className="bg-white border-b-2 border-gray-200 sticky top-0 z-50" aria-label="主导航">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="text-3xl" role="img" aria-label="猫头鹰">🦉</span>
            <span className="font-extrabold text-2xl text-[#58cc02] tracking-tight hidden sm:block">DuoDash</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs text-gray-600 font-semibold" aria-live="polite">
                {getUpdateStatusText(loading, lastUpdated)}
              </span>
            </div>
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
