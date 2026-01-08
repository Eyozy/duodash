import React from 'react';

interface NavbarProps {
    loading: boolean;
    lastUpdated: number | null;
    onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ loading, lastUpdated, onRefresh }) => {
    return (
        <nav className="bg-white border-b-2 border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-2">
                        <span className="text-3xl">🦉</span>
                        <span className="font-extrabold text-2xl text-[#58cc02] tracking-tight hidden sm:block">DuoDash</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end leading-tight">
                            {loading ? (
                                <span className="text-xs text-gray-600 font-semibold">正在更新…</span>
                            ) : lastUpdated ? (
                                <span className="text-xs text-gray-600 font-semibold">
                                    更新于 {new Date(lastUpdated).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            ) : (
                                <span className="text-xs text-gray-600 font-semibold">尚未更新</span>
                            )}
                        </div>
                        <button
                            onClick={onRefresh}
                            disabled={loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="刷新数据"
                        >
                            <span className={`text-base ${loading ? 'animate-spin' : ''}`}>🔄</span>
                            <span className="hidden sm:inline font-semibold text-gray-700 text-sm">刷新</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
