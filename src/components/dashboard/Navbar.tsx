import { memo } from 'react';
import type { ReactElement } from 'react';
import { ShareIcon, RefreshIcon } from '../icons';
import { CACHE_TTL_MS } from '../../constants/config';

interface NavbarProps {
  loading: boolean;
  lastUpdated: number | null;
  onRefresh: () => void;
  onShare?: () => void;
}

function getUpdateStatusText(loading: boolean, lastUpdated: number | null, now: number): string {
  if (loading) return '正在更新…';
  if (lastUpdated) {
    const timeStr = new Date(lastUpdated).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const isOld = now - lastUpdated > CACHE_TTL_MS;
    if (isOld) {
      return `缓存数据 (${timeStr})`;
    }
    return `更新于 ${timeStr}`;
  }
  return '尚未更新';
}

export const Navbar = memo(function Navbar({ loading, lastUpdated, onRefresh, onShare }: NavbarProps): ReactElement {
  const now = Date.now();
  const isStale = Boolean(lastUpdated && now - lastUpdated > CACHE_TTL_MS);

  return (
    <nav className="bg-surface border-b border-neutral-100 sticky top-0 z-50" aria-label="主导航">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Duo Owl" className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
            <span className="font-extrabold text-xl sm:text-2xl text-[#58cc02] tracking-tight hidden xs:block">DuoDash</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden md:flex flex-col items-end leading-tight">
              <span className={`text-xs font-semibold ${isStale ? 'text-amber-500' : 'text-neutral-500'}`} aria-live="polite">
                {getUpdateStatusText(loading, lastUpdated, now)}
              </span>
            </div>
            {onShare && (
              <button
                onClick={onShare}
                className="surface-button px-2.5 py-2 sm:px-3 sm:py-2 min-h-[44px] sm:min-h-0"
                aria-label="打开分享卡片对话框"
              >
                <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-800" aria-hidden="true" />
                <span className="hidden md:inline font-semibold text-neutral-800 text-sm">分享</span>
              </button>
            )}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="surface-button px-2.5 py-2 sm:px-3 sm:py-2 min-h-[44px] sm:min-h-0 disabled:cursor-not-allowed disabled:opacity-50"
              title="刷新数据"
              aria-label={loading ? '正在刷新数据' : '刷新数据'}
            >
              <RefreshIcon className={`w-4 h-4 sm:w-5 sm:h-5 text-neutral-800 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline font-semibold text-neutral-800 text-sm">刷新</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
});
