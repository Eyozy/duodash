import React from 'react';
import type { UserData } from '../../types';

interface TodayOverviewProps {
    userData: UserData | null;
    seq: number;
}

/**
 * 今日概览卡片 - 显示今日 XP、课程数、连胜状态
 */
export const TodayOverview: React.FC<TodayOverviewProps> = ({ userData, seq }) => {
    const getTodayTime = () => {
        if (!userData?.dailyTimeHistory || userData.dailyTimeHistory.length === 0) return '-';
        return userData.dailyTimeHistory[userData.dailyTimeHistory.length - 1].time || '-';
    };

    return (
        <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 border-b-4 border-gray-200 animate-seq seq-${seq}`}>
            <h2 className="text-gray-700 font-bold text-lg mb-3">今日概览</h2>
            <div className="flex flex-col gap-3">
                {/* 今日 XP 和课程 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#58cc02]/10 rounded-xl p-3 text-center">
                        <div className="text-2xl font-extrabold text-[#58cc02]">
                            {userData ? (userData.xpToday ?? '-') : '—'}
                        </div>
                        <div className="text-xs text-gray-500 font-bold mt-1">今日 XP</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-extrabold text-blue-500">
                            {userData ? (userData.lessonsToday ?? '-') : '—'}
                        </div>
                        <div className="text-xs text-gray-500 font-bold mt-1">今日课程</div>
                    </div>
                </div>
                {/* 连胜和学习时间 */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-extrabold text-orange-500">
                            {userData ? userData.streak : '—'}
                        </div>
                        <div className="text-xs text-gray-500 font-bold mt-1">连胜天数</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                        <div className="text-2xl font-extrabold text-purple-500">{getTodayTime()}</div>
                        <div className="text-xs text-gray-500 font-bold mt-1">学习分钟</div>
                    </div>
                </div>
                {/* 学习状态显示 */}
                {userData && userData.xpToday && userData.xpToday > 0 ? (
                    <div className="text-sm text-center">
                        <div className="text-gray-700 font-semibold">
                            🔥 今日已学习 {userData.xpToday} XP
                        </div>
                        {userData.streakExtendedTime && (
                            <div className="text-xs text-gray-600 mt-1">
                                {userData.streakExtendedTime} 保住连胜
                            </div>
                        )}
                    </div>
                ) : userData && userData.streakExtendedToday ? (
                    <div className="text-sm text-center text-blue-500">
                        ❄️ 使用了连胜冻结卡
                    </div>
                ) : (
                    <div className="text-sm text-center text-gray-600">
                        ⏰ 今日还未学习
                    </div>
                )}
            </div>
        </div>
    );
};

export default TodayOverview;
